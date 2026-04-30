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
  ViewTodo: {todoId: number};
  EditTodo: {todoId?: number; subjectId?: number; subjectName?: string};
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
export type EditTodoScreenNavigationProp = StackNavigationProp<
  TodoStackParamList,
  'EditTodo'
>;
export type ViewTodoScreenNavigationProp = StackNavigationProp<
  TodoStackParamList,
  'ViewTodo'
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
export type ViewTodoScreenRouteProp = RouteProp<TodoStackParamList, 'ViewTodo'>;
export type EditTodoScreenRouteProp = RouteProp<TodoStackParamList, 'EditTodo'>;

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

export type EditTodoScreenProp = {
  navigation: EditTodoScreenNavigationProp;
  route: EditTodoScreenRouteProp;
};
export type ViewTodoScreenProp = {
  navigation: ViewTodoScreenNavigationProp;
  route: ViewTodoScreenRouteProp;
};
