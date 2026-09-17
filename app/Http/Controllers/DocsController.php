<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\Extension\HeadingPermalink\HeadingPermalinkExtension;
use League\CommonMark\Extension\Table\TableExtension;
use League\CommonMark\MarkdownConverter;
use Illuminate\Support\Facades\File;

class DocsController extends Controller
{
    public function show($page = 'README')
    {
        // 1. Get the path to the lodexi-docs directory
        $docsPath = base_path('../lodexi-docs');
        $filePath = $docsPath . '/' . $page . '.md';

        // 2. Check if the file exists
        if (!File::exists($filePath)) {
            abort(404, 'Documentation page not found.');
        }

        // 3. Read the markdown content
        $markdownContent = File::get($filePath);

        // 4. Configure CommonMark
        $config = [
            'heading_permalink' => [
                'html_class' => 'heading-permalink',
                'id_prefix' => 'content',
                'insert' => 'before',
                'title' => 'Permalink',
                'symbol' => '#',
            ],
        ];

        $environment = new Environment($config);
        $environment->addExtension(new CommonMarkCoreExtension());
        $environment->addExtension(new TableExtension());
        $environment->addExtension(new HeadingPermalinkExtension());

        $converter = new MarkdownConverter($environment);

        // 5. Convert markdown to HTML
        $htmlContent = $converter->convert($markdownContent)->getContent();

        // 6. Hardcode sidebar navigation structure for MVP
        $navigation = [
            'Introduction' => [
                'README' => 'Overview',
                'quickstart' => 'Quickstart',
            ],
            'Authentication' => [
                'auth/api-keys' => 'API Keys',
                'auth/oauth' => 'OAuth 2.0',
            ],
            'API Reference' => [
                'api/endpoints' => 'Endpoints',
                'api/models' => 'Models',
            ],
            'Integrations' => [
                'integrations/google-chat' => 'Google Chat',
                'integrations/slack' => 'Slack',
            ],
        ];

        // 7. Render Inertia page
        return Inertia::render('Docs/Index', [
            'content' => $htmlContent,
            'navigation' => $navigation,
            'currentPage' => $page,
        ]);
    }
}
