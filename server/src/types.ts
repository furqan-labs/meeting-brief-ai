export interface ActionItem {
  task: string;
  owner: string | null;
  dueDate: string | null;
}

export interface MeetingBrief {
  summary: string;
  actionItems: ActionItem[];
  followUpEmail: string;
}

export interface AnalyzeRequestBody {
  transcript: string;
  apiKey: string;
}
