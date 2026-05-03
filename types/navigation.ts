import { StackNavigationProp } from '@react-navigation/stack';
import { NavigatorScreenParams, RouteProp } from '@react-navigation/native';

//routes and parameters
export type TimerStackParamList = {
    TimerSelection: undefined;
    CountUpTimer: { subjectName: string };
    PomodoroTimer: { subjectName: string };
};

export type MainTabParamList = {
    Home: undefined;
};

export type RootStackParamList = {
    AppTabs: undefined;
    TimerFlow: NavigatorScreenParams<TimerStackParamList>; 
};

//navigation prop types
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AppTabs'>;
export type TimerSelectionScreenNavigationProp = StackNavigationProp<TimerStackParamList, 'TimerSelection'>;
export type CountUpTimerScreenNavigationProp = StackNavigationProp<TimerStackParamList, 'CountUpTimer'>;
export type PomodoroTimerScreenNavigationProp = StackNavigationProp<TimerStackParamList, 'PomodoroTimer'>;

//route prop types
export type CountUpTimerScreenRouteProp = RouteProp<TimerStackParamList, 'CountUpTimer'>;
export type PomodoroTimerScreenRouteProp = RouteProp<TimerStackParamList, 'PomodoroTimer'>;

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

