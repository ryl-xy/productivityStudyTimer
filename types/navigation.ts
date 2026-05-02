import {StackNavigationProp} from '@react-navigation/stack';
import {NavigatorScreenParams, RouteProp} from '@react-navigation/native';

export type TimerStackParamList = {
  TimerSelection: undefined;
  CountUpTimer: {subjectName: string; taskId?: number; taskName?: string};
  PomodoroTimer: {subjectName: string};
};

export type RootStackParamList = {
  Main: undefined;
  TimerFlow: NavigatorScreenParams<TimerStackParamList>;
};

export type TodoStackParamList = {
  TodoList: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<RootStackParamList>;
  Todo: undefined;
  Profiles: undefined;
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;
export type TimerSelectionScreenNavigationProp = StackNavigationProp<TimerStackParamList, 'TimerSelection'>;
export type CountUpTimerScreenNavigationProp = StackNavigationProp<TimerStackParamList, 'CountUpTimer'>;
export type PomodoroTimerScreenNavigationProp = StackNavigationProp<TimerStackParamList, 'PomodoroTimer'>;
export type TodoScreenNavigationProp = StackNavigationProp<TodoStackParamList, 'TodoList'>;

export type CountUpTimerScreenRouteProp = RouteProp<TimerStackParamList, 'CountUpTimer'>;
export type PomodoroTimerScreenRouteProp = RouteProp<TimerStackParamList, 'PomodoroTimer'>;

export type CountUpTimerScreenProps = {
  navigation: CountUpTimerScreenNavigationProp;
  route: CountUpTimerScreenRouteProp;
};
export type PomodoroTimerScreenProps = {
  navigation: PomodoroTimerScreenNavigationProp;
  route: PomodoroTimerScreenRouteProp;
};
export type TimerSelectionScreenProps = {
  navigation: TimerSelectionScreenNavigationProp;
};
export type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};
export type ToDoListScreenProp = {
  navigation: TodoScreenNavigationProp;
};