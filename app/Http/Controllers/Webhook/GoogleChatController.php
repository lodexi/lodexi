<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Project;
use App\Services\LodexService;

class GoogleChatController extends Controller
{
    public function handle(Request $request, $tenant_id)
    {
        // 1. Log the incoming request for debugging
        Log::info('Google Chat Webhook received for tenant: ' . $tenant_id, $request->all());

        // 2. Fetch the Project (Tenant)
        $project = Project::find($tenant_id);
        if (!$project) {
            return response()->json(['error' => 'Invalid tenant ID'], 404);
        }

        // Optional: Simple Bearer Token verification
        $token = $request->bearerToken();
        if (!$token) {
            Log::warning('Google Chat Webhook missing Bearer token');
        }

        // 3. Process the event type
        $type = $request->input('type');

        if ($type === 'ADDED_TO_SPACE') {
            return response()->json([
                'text' => 'Hello! I am LODEXI. I am securely connected to your AI Project: *' . $project->name . '*. You can ask me anything about your knowledge base!'
            ]);
        }

        if ($type === 'MESSAGE') {
            $messageText = $request->input('message.text', '');
            
            // Clean up @bot mentions
            $messageText = preg_replace('/^@\w+\s*/', '', trim($messageText));

            if (empty($messageText)) {
                return response()->json(['text' => 'Please provide a question.']);
            }

            try {
                // Call Unified LodexService directly with the resolved Project (Tenant)
                $lodexService = app(LodexService::class);
                $response = $lodexService->ask($messageText, 4, null, $project);

                $answer = $response['answer'] ?? 'Sorry, I could not process your request.';
                
                // Format citations if any
                if (!empty($response['citations'])) {
                    $citationsText = "\n\n*Citations:*";
                    foreach ($response['citations'] as $idx => $citation) {
                        $citationsText .= "\n" . ($idx + 1) . ". " . $citation['title'] . " (" . $citation['external_id'] . ")";
                    }
                    $answer .= $citationsText;
                }

                return response()->json([
                    'text' => $answer
                ]);

            } catch (\Exception $e) {
                Log::error('Lodexi-Core Error: ' . $e->getMessage());
                return response()->json([
                    'text' => 'An error occurred while communicating with the AI Engine: ' . $e->getMessage()
                ]);
            }
        }

        return response()->json(['text' => 'Event not supported']);
    }
}
