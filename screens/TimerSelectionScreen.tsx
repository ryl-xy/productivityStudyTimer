// screens/TimerSelectionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TimerSelectionScreenProps } from '../types/navigation';

interface Subject {
  id: string;
  name: string;
  icon: string;
}

const DRINK_ICONS = [
  { id: '1', name: '☕', label: 'Coffee' },
  { id: '2', name: '🍵', label: 'Tea' },
  { id: '3', name: '🥤', label: 'Soda' },
  { id: '4', name: '🧋', label: 'Bubble Tea' },
];

export default function TimerSelectionScreen({ navigation }: TimerSelectionScreenProps) {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', icon: '☕' },
    { id: '2', name: 'Science', icon: '🍵' },
    { id: '3', name: 'History', icon: '🥤' },
    { id: '4', name: 'Programming', icon: '🧋' },
  ]);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedDrink, setSelectedDrink] = useState('☕');
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);

  const addSubject = () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }

    const newSubject: Subject = {
      id: Date.now().toString(),
      name: newSubjectName,
      icon: selectedDrink,
    };

    setSubjects([...subjects, newSubject]);
    setNewSubjectName('');
    setShowAddSubject(false);
    setSelectedDrink('☕');
  };

  const handleTimerSelect = (subject: Subject, timerType: 'countup' | 'pomodoro') => {
    if (timerType === 'countup') {
      navigation.navigate('CountUpTimer', { subjectName: subject.name });
    } else {
      navigation.navigate('PomodoroTimer', { subjectName: subject.name });
    }
  };

  const renderSubject = ({ item }: { item: Subject }) => (
    <View style={styles.subjectCard}>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectIcon}>{item.icon}</Text>
        <Text style={styles.subjectName}>{item.name}</Text>
      </View>
      
      <View style={styles.timerButtons}>
        <TouchableOpacity
          style={[styles.timerButton, styles.countUpButton]}
          onPress={() => handleTimerSelect(item, 'countup')}
        >
          <Text style={styles.timerButtonText}>⏱️ Count Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.timerButton, styles.pomodoroButton]}
          onPress={() => handleTimerSelect(item, 'pomodoro')}
        >
          <Text style={styles.timerButtonText}>🍅 Pomodoro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.background} blurRadius={2}>
      <View style={styles.overlay}>
        <Text style={styles.title}>📚 Choose Your Study Session</Text>

        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={renderSubject}
          contentContainerStyle={styles.listContainer}
        />

        {showAddSubject ? (
          <View style={styles.addSubjectForm}>
            <TextInput
              style={styles.input}
              placeholder="Subject name"
              placeholderTextColor="#999"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
            />
            
            <TouchableOpacity
              style={styles.drinkSelector}
              onPress={() => setShowDrinkPicker(!showDrinkPicker)}
            >
              <Text style={styles.selectedDrink}>
                Choose drink: {selectedDrink}
              </Text>
            </TouchableOpacity>

            {showDrinkPicker && (
              <View style={styles.drinkPicker}>
                {DRINK_ICONS.map((drink) => (
                  <TouchableOpacity
                    key={drink.id}
                    style={styles.drinkOption}
                    onPress={() => {
                      setSelectedDrink(drink.name);
                      setShowDrinkPicker(false);
                    }}
                  >
                    <Text style={styles.drinkIcon}>{drink.name}</Text>
                    <Text style={styles.drinkLabel}>{drink.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setShowAddSubject(false);
                setNewSubjectName('');
                setSelectedDrink('☕');
              }}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.saveButton} onPress={addSubject}>
                <Text style={styles.buttonText}>Add Subject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddSubject(true)}
          >
            <Icon name="add-circle" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Add New Subject</Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  subjectCard: {
    backgroundColor: 'rgba(255, 248, 220, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  subjectIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C3A21',
  },
  timerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  countUpButton: {
    backgroundColor: '#8B4513',
  },
  pomodoroButton: {
    backgroundColor: '#D2691E',
  },
  timerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#8B4513',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  addSubjectForm: {
    backgroundColor: 'rgba(255, 248, 220, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 15,
  },
  drinkSelector: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  selectedDrink: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  drinkPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
  },
  drinkOption: {
    alignItems: 'center',
    width: '25%',
    padding: 10,
  },
  drinkIcon: {
    fontSize: 30,
  },
  drinkLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#999',
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#8B4513',
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});