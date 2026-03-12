# Project Plan: Google Gemini API Integration

**Objective**: Integrate the free Google Gemini API to power the existing "OJT A.I. UPLINK" Chat Widget in the OJT Web App.

## 1. Architecture & Security Approach

To protect the Gemini API key, the frontend React application will **never** communicate directly with Google's servers. Instead, it will send the prompt to our PHP backend, which will securely handle the API call and return the response.

- **Frontend (`AIChatWidget.jsx`)**: Sends `POST` requests containing the user's message to a new PHP endpoint.
- **Backend (`api/endpoints/chat.php`)**: Receives the prompt, reads the Gemini API key from a secure configuration, constructs the payload, and sends a cURL request to `generativelanguage.googleapis.com`.

## 2. Prerequisites

- A valid Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/app/apikey)).
- The key will be stored in `api/config/Database.php` (or a dedicated configuration file/environment variable).

## 3. Implementation Steps

1.  **Backend Integration (`api/endpoints/chat.php`)**:
    - Create a new PHP file to handle `POST` requests.
    - Implement CORS headers (like other endpoints).
    - Read the JSON input (`{"message": "user prompt"}`).
    - Use PHP `curl` to send a request to `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY`.
    - Format the prompt to include a "System Instruction" so the AI knows its persona (e.g., "You are an AI assistant for an OJT portal. Respond in a high-tech, mission-control style...").
    - Parse the JSON response from Gemini.
    - Return the extracted text back to the frontend.

2.  **Configuration Setup**:
    - Add a placeholder or secure way to inject the API key into the backend without hardcoding it directly into version control (e.g., creating an `api/.env_example` or adding it as an ignored config file).

3.  **Frontend Update (`src/components/AIChatWidget.jsx`)**:
    - Replace the current `setTimeout` simulated response logic.
    - Implement an `axios.post` call to `http://localhost/ojt/api/endpoints/chat.php` with the user's input.
    - Handle loading states (`isTyping`) while waiting for the HTTP response.
    - Extract the message from the API response and append it to the chat history state.
    - Implement error handling (e.g., if the backend connection fails or the API key is missing).

## 4. Verification Plan

- **Backend Test**: Use tools like Postman or cURL to send a bare `POST` request to `chat.php` and verify a valid JSON response from Gemini returning.
- **Frontend Test**: Open the OJT Portal, click the floating UPLINK widget, ask a question, and verify that the AI responds dynamically context based on the input.

## 5. Agent Assignments

- `backend-specialist`: To build `api/endpoints/chat.php` and handle the cURL requests to Google securely.
- `frontend-specialist`: To rip out the simulated logic in `AIChatWidget.jsx` and wire it up to the new backend endpoint.
