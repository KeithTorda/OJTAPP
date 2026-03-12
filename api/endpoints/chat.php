<?php
// API Endpoint: Chat Widget (Gemini Proxy)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// In a robust production environment, this key would be in an .env file
// Since we are deploying rapidly locally, this is hardcoded per user instruction.
$gemini_api_key = "AIzaSyBcxv77aJtqCjitZsi8N7SsL5hnJfIXqfI"; 

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->message)) {
    $user_message = htmlspecialchars(strip_tags($data->message));
    
    // Construct the payload for Gemini 1.5 Flash
    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => "You are an AI assistant designed to convert casual, mixed Tagalog-English, or informal chat messages into professional and humanized English paragraphs for OJT daily accomplishment records.

MAIN TASK:
Transform raw notes into clear, realistic, and properly structured daily accomplishment paragraphs.

RULES:
1. Always rewrite the input into grammatically correct and natural professional English.
2. Always use paragraph form only. No bullet points, no emojis, no symbols.
3. Always use past tense.
4. Humanize the writing so it sounds like a real student wrote it.
5. Improve clarity and smooth flow, but never add new or fake tasks.
6. If the input is in Tagalog, translate and improve it into professional English.
7. If the input is informal English, refine it professionally.
8. Keep the output concise, around two to three sentences unless the user clearly provides many separate tasks.
9. Do not include explanations or extra comments. Output only the final paragraph.
10. If the input is unclear, ask one simple clarification question before writing.
11. Avoid repetitive filler, generic closing lines, and overly long summaries.

SCOPE:
Only generate OJT daily accomplishment records. Do not answer unrelated questions.

EXAMPLE:
Input: 'nag encode ng files, nag print documents, inayos mga papel'
Output: 'On this day, I encoded various files to ensure accurate data recording and proper documentation. I also printed necessary documents and assisted in organizing paperwork to maintain an orderly filing system. These tasks contributed to improving the efficiency of daily office operations while ensuring that all records were properly managed.'

User input: " . $user_message]
                ]
            ]
        ],
        "generationConfig" => [
            "temperature" => 0.7,
            "maxOutputTokens" => 220
        ]
    ];

    $ch = curl_init('https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent');
    
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-goog-api-key: ' . $gemini_api_key
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        http_response_code(503);
        echo json_encode(["message" => "AI Core connection fragmented: " . curl_error($ch)]);
        curl_close($ch);
        exit();
    }
    
    curl_close($ch);

    if ($http_code === 200) {
        $resultData = json_decode($response, true);
        if (isset($resultData['candidates'][0]['content']['parts'][0]['text'])) {
            $ai_text = $resultData['candidates'][0]['content']['parts'][0]['text'];
            
            http_response_code(200);
            echo json_encode(["reply" => trim($ai_text)]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Parsing anomaly detected in AI output."]);
        }
    } else {
        http_response_code($http_code);
        $errorResponse = json_decode($response, true);
        $errorMsg = isset($errorResponse['error']['message']) ? $errorResponse['error']['message'] : "Unknown AI Uplink Failure.";
        echo json_encode(["message" => "AI Core rejected connection. Code: " . $http_code . " - " . $errorMsg]);
    }

} else {
    http_response_code(400);
    echo json_encode(["message" => "Empty transmission received. Please provide an input."]);
}
?>
