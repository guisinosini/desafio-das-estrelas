export type TaskRecurrence = 'daily' | 'weekly' | 'monthly' | 'once';
export type Task = { id: string; title: string; stars: number; recurrence: TaskRecurrence; status: 'available' | 'pending' | 'done'; lastCompleted?: string; };
export type Reward = { id: string; title: string; cost: number; };
export type Planet = { id: string; title: string; icon?: string; achieved: boolean; };
export type ChildData = {
  id: string;
  name: string;
  avatar: string;
  stars: number;
  dailyStars: number;
  planets: Planet[];
  tasks: Task[];
  rewards: Reward[];
  badges: string[];
  history: { id: string, title: string, type: 'gain' | 'loss' | 'redeem', amount: number, date: string }[];
};
export type Stage = 'welcome' | 'auth' | 'enter_code' | 'reset_password' | 'select_child' | 'setup_child' | 'setup_avatar' | 'setup_planets' | 'setup_tasks' | 'setup_rewards' | 'adventure';
