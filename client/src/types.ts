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

export interface ApiErrorBody {
  error: string;
}
