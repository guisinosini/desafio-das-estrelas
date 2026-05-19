export type TaskRecurrence = 'daily' | 'weekly' | 'monthly' | 'once';
export type Task = {
  id: string;
  title: string;
  stars: number;
  recurrence: TaskRecurrence;
  status: 'available' | 'pending' | 'done';
  lastCompleted?: string;
  planetId?: string;
  /** Histórico de todos os timestamps ISO de conclusão aprovada. Usado pelo relatório clínico para filtrar por período com precisão. */
  completionLog?: string[];
};
export type Reward = { id: string; title: string; cost: number; };
export type Planet = { id: string; title: string; icon?: string; achieved: boolean; };
export type ChildData = {
  id: string;
  name: string;
  avatar: string;
  gender: 'boy' | 'girl' | 'other';
  birthDate?: string;
  age?: number;
  schoolGrade?: string;
  stars: number;
  dailyStars: number;
  planets: Planet[];
  tasks: Task[];
  rewards: Reward[];
  badges: string[];
  history: { 
    id: string; 
    title: string; 
    type: 'gain' | 'loss' | 'redeem' | 'note'; 
    amount: number; 
    date: string;
    content?: string;
    playTime?: number;
    scoreText?: string;
  }[];
};
export type Stage = 'landing' | 'welcome' | 'auth' | 'enter_code' | 'reset_password' | 'select_child' | 'setup_child' | 'setup_avatar' | 'setup_planets' | 'setup_tasks' | 'setup_rewards' | 'adventure' | 'no_subscription' | 'searching_signal';
