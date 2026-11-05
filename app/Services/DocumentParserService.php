<?php

namespace App\Services;

use ZipArchive;

class DocumentParserService
{
    /**
     * Extract text segmented by pages/sections from TXT, DOCX, or PDF files.
     * Compatible with standard shared/cloud hosting (e.g., Hostinger) without external binaries.
     *
     * @return array<int, array{page: int, text: string}>
     */
    public function extractPagesFromFile(string $filePath, string $filename): array
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        return match ($ext) {
            'txt', 'md', 'csv' => $this->extractTxt($filePath),
            'docx' => $this->extractDocx($filePath),
            'pdf' => $this->extractPdf($filePath),
            default => throw new \InvalidArgumentException("Format file tidak didukung: .{$ext}"),
        };
    }

    /**
     * Split text into clean, overlapping chunks respecting paragraph and sentence boundaries.
     *
     * @return array<int, string>
     */
    public function chunkText(string $text, int $chunkSize = 500, int $overlap = 50): array
    {
        $text = trim($text);
        if ($text === '') {
            return [];
        }

        if (mb_strlen($text) <= $chunkSize) {
            return [$text];
        }

        $paragraphs = preg_split('/\R{2,}/u', $text) ?: [$text];
        $paragraphs = array_values(array_filter(array_map('trim', $paragraphs), fn ($p) => $p !== ''));

        $chunks = [];
        $currentChunk = '';

        foreach ($paragraphs as $para) {
            if (mb_strlen($para) > $chunkSize) {
                $sentences = preg_split('/(?<=[.!?])\s+/u', $para) ?: [$para];
                foreach ($sentences as $sent) {
                    $sent = trim($sent);
                    if ($sent === '') {
                        continue;
                    }

                    if (mb_strlen($currentChunk) + mb_strlen($sent) + 1 <= $chunkSize) {
                        $currentChunk = trim($currentChunk . ' ' . $sent);
                    } else {
                        if ($currentChunk !== '') {
                            $chunks[] = $currentChunk;
                            $overlapTail = mb_strlen($currentChunk) > $overlap
                                ? mb_substr($currentChunk, -$overlap)
                                : $currentChunk;
                            $currentChunk = trim($overlapTail . ' ' . $sent);
                        } else {
                            $currentChunk = mb_substr($sent, 0, $chunkSize);
                        }
                    }
                }
            } else {
                if (mb_strlen($currentChunk) + mb_strlen($para) + 2 <= $chunkSize) {
                    $currentChunk = trim($currentChunk . "\n\n" . $para);
                } else {
                    if ($currentChunk !== '') {
                        $chunks[] = $currentChunk;
                        $overlapTail = mb_strlen($currentChunk) > $overlap
                            ? mb_substr($currentChunk, -$overlap)
                            : '';
                        $currentChunk = $overlapTail !== '' ? trim($overlapTail . "\n\n" . $para) : $para;
                    } else {
                        $currentChunk = $para;
                    }
                }
            }
        }

        if ($currentChunk !== '') {
            $chunks[] = $currentChunk;
        }

        return $chunks ?: [$text];
    }

    protected function extractTxt(string $filePath): array
    {
        $content = @file_get_contents($filePath);
        if ($content === false) {
            return [];
        }

        $content = trim(mb_convert_encoding($content, 'UTF-8', 'UTF-8'));
        return $content !== '' ? [['page' => 1, 'text' => $content]] : [];
    }

    protected function extractDocx(string $filePath): array
    {
        if (!class_exists(ZipArchive::class)) {
            throw new \RuntimeException('Ekstensi PHP ZipArchive diperlukan untuk membaca file DOCX.');
        }

        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            throw new \RuntimeException('Gagal membuka arsip DOCX.');
        }

        $xmlContent = $zip->getFromName('word/document.xml');
        $zip->close();

        if ($xmlContent === false) {
            return [];
        }

        // Preserve paragraph breaks before stripping tags
        $xmlContent = str_replace(['</w:p>', '<w:br/>', '<w:cr/>'], ["\n\n", "\n", "\n"], $xmlContent);
        $text = trim(html_entity_decode(strip_tags($xmlContent), ENT_QUOTES | ENT_XML1, 'UTF-8'));
        $text = preg_replace("/\n{3,}/", "\n\n", $text) ?? $text;

        return $text !== '' ? [['page' => 1, 'text' => $text]] : [];
    }

    protected function extractPdf(string $filePath): array
    {
        // 1. Use smalot/pdfparser if available in vendor
        if (class_exists(\Smalot\PdfParser\Parser::class)) {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($filePath);
            $pages = [];
            foreach ($pdf->getPages() as $idx => $page) {
                $pageText = trim($page->getText());
                if ($pageText !== '') {
                    $pages[] = [
                        'page' => $idx + 1,
                        'text' => $pageText,
                    ];
                }
            }
            if (!empty($pages)) {
                return $pages;
            }
        }

        // 2. Built-in Pure-PHP PDF FlateDecode & Text Operator Extractor Fallback
        $raw = @file_get_contents($filePath);
        if ($raw === false || $raw === '') {
            return [];
        }

        $extractedBlocks = [];

        if (preg_match_all('/stream[\r\n]+(.*?)[\r\n]+endstream/s', $raw, $matches)) {
            foreach ($matches[1] as $stream) {
                $decoded = @gzuncompress($stream);
                if ($decoded === false) {
                    $decoded = @gzinflate($stream);
                }
                $data = $decoded !== false ? $decoded : $stream;

                // Extract parenthesized PDF text strings (...) inside BT ... ET or TJ/Tj blocks
                if (preg_match_all('/\(([^()\\\\]*(?:\\\\.[^()\\\\]*)*)\)\s*T[jJ]/s', $data, $tjMatches)) {
                    foreach ($tjMatches[1] as $str) {
                        $extractedBlocks[] = $this->cleanPdfString($str);
                    }
                }
                if (preg_match_all('/\[(.*?)\]\s*TJ/s', $data, $arrayMatches)) {
                    foreach ($arrayMatches[1] as $arr) {
                        if (preg_match_all('/\(([^()\\\\]*(?:\\\\.[^()\\\\]*)*)\)/s', $arr, $subMatches)) {
                            $extractedBlocks[] = $this->cleanPdfString(implode('', $subMatches[1]));
                        }
                    }
                }
            }
        }

        $fullText = trim( implode(' ', array_filter($extractedBlocks, fn ($s) => $s !== '')) );
        if ($fullText === '') {
            return [];
        }

        // Segment into logical pages (~2000 chars per page when native page tree isn't parsed)
        $logicalPages = str_split($fullText, 2000);
        $pages = [];
        foreach ($logicalPages as $idx => $chunk) {
            $pages[] = [
                'page' => $idx + 1,
                'text' => trim($chunk),
            ];
        }

        return $pages;
    }

    protected function cleanPdfString(string $str): string
    {
        $str = strtr($str, [
            '\\n' => "\n",
            '\\r' => "\r",
            '\\t' => "\t",
            '\\(' => '(',
            '\\)' => ')',
            '\\\\' => '\\',
        ]);
        // Keep printable UTF-8 / ASCII characters
        $str = preg_replace('/[^\P{C}\n\t]+/u', '', $str) ?? $str;
        return trim($str);
    }
}

