import {StackNavigationProp} from '@react-navigation/stack';
import {NavigatorScreenParams, RouteProp} from '@react-navigation/native';

//routes and parameters
export type TimerStackParamList = {
  TimerSelection: undefined;
  CountUpTimer: {subjectName: string; taskId?: number; taskName?: string};
  PomodoroTimer: {subjectName: string};
};

export type MainTabParamList = {
  Home: undefined;
  TodoFlow: NavigatorScreenParams<TodoStackParamList>;
};

export type RootStackParamList = {
  Main: undefined;
  TimerFlow: NavigatorScreenParams<TimerStackParamList>;
};

export type TodoStackParamList = {
  TodoList: undefined;
};

//navigation prop types
export type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Main'
>;
export type TimerSelectionScreenNavigationProp = StackNavigationProp<
  TimerStackParamList,
  'TimerSelection'
>;
export type CountUpTimerScreenNavigationProp = StackNavigationProp<
  TimerStackParamList,
  'CountUpTimer'
>;
export type PomodoroTimerScreenNavigationProp = StackNavigationProp<
  TimerStackParamList,
  'PomodoroTimer'
>;
export type TodoScreenNavigationProp = StackNavigationProp<
  TodoStackParamList,
  'TodoList'
>;

//route prop types
export type CountUpTimerScreenRouteProp = RouteProp<
  TimerStackParamList,
  'CountUpTimer'
>;
export type PomodoroTimerScreenRouteProp = RouteProp<
  TimerStackParamList,
  'PomodoroTimer'
>;

//combined prop types
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
