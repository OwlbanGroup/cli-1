export interface CreateTaskRequest {
  prompt: string;
  repoUrl: string;
  selectedAgent: string;
  selectedModel: string;
}

export interface CreateTaskResponse {
  id?: string;
  status?: string;
  taskUrl?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export async function createTask(
  apiKey: string,
  request: CreateTaskRequest
): Promise<CreateTaskResponse> {
  const response = await fetch('https://cloud.blackbox.ai/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.statusText}`);
  }

  const data = await response.json() as CreateTaskResponse;
  return data;
}
