import axios from 'axios';
import { appConfig } from '../config/app.config.js';
export async function getDefinitionById(id: string): Promise<{ id: string; name: string; status: string; steps: unknown[] } | null> {
  try {
    const { data } = await axios.get<{ success: boolean; data: { id: string; name: string; status: string; steps: unknown[] } }>(`${appConfig.workflowDefinitionServiceUrl}/definitions/${id}`, { timeout: 5000 });
    return data.success ? data.data : null;
  } catch { return null; }
}
