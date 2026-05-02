// screens/TimerSelectionScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  TextInput,
  Alert,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {TimerSelectionScreenProps} from '../types/navigation';
import {useProfile, Subject} from '../context/profileContext.tsx';
import baseUrl from '../API/index';

interface Subject {
  id: string | number;
  name: string;
  drink_icon: string;
  color?: string;
}

const DRINK_ICONS = [
  {id: '1', name: '☕', label: 'Coffee'},
  {id: '2', name: '🍵', label: 'Tea'},
  {id: '3', name: '🥤', label: 'Soda'},
  {id: '4', name: '🧋', label: 'Bubble Tea'},
];

export default function TimerSelectionScreen({
  navigation,
}: TimerSelectionScreenProps) {
  const {activeProfile, addSubjectToProfile, removeSubjectFromProfile} =
    useProfile();

  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedDrink, setSelectedDrink] = useState('☕');
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);

  // Fetch subjects from backend
  const fetchSubjects = () => {
    fetch(baseUrl + '/api/subjects')
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
      })
      .catch(error => {
        console.error('Error fetching subjects:', error);
        ToastAndroid.show('Failed to load subjects', ToastAndroid.SHORT);
      });
  };

  // Seed database with hardcoded subjects on first load
  const seedDatabase = () => {
    HARDCODED_SUBJECTS.forEach(subject => {
      fetch(baseUrl + '/api/subjects', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(subject),
      }).catch(error => console.error('Error seeding subject:', error));
    });
  };

  useEffect(() => {
    fetchSubjects();
    // Attempt to seed database - if subjects already exist, this won't duplicate them
    // console.log(subjects);
    // seedDatabase();
  }, []);

  const addSubject = () => {
    if (!newSubjectName.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }
    if (!activeProfile) return;

    // Generate a random color
    const colors = [
      '#FF5733',
      '#33FF57',
      '#3357FF',
      '#FF33F5',
      '#FFD700',
      '#FF6B6B',
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const subjectData = {
      name: newSubjectName.trim(),
      drink_icon: selectedDrink,
      color: randomColor,
    };

    // POST to backend
    fetch(baseUrl + '/api/subjects', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(subjectData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.affected > 0) {
          ToastAndroid.show('Subject added!', ToastAndroid.SHORT);
          setNewSubjectName('');
          setShowAddSubject(false);
          setSelectedDrink('☕');
          // Refresh subjects list
          fetchSubjects();
        }
      })
      .catch(error => {
        console.error('Error adding subject:', error);
        ToastAndroid.show('Failed to add subject', ToastAndroid.SHORT);
      });
  };

  const handleDelete = (subject: Subject) => {
    if (!activeProfile) return;
    Alert.alert('Remove Subject', `Remove "${subject.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeSubjectFromProfile(activeProfile.id, subject.id),
      },
    ]);
  };

  const handleTimerSelect = (
    subject: Subject,
    timerType: 'countup' | 'pomodoro',
  ) => {
    if (timerType === 'countup') {
      navigation.navigate('CountUpTimer', {subjectName: subject.name});
    } else {
      navigation.navigate('PomodoroTimer', {subjectName: subject.name});
    }
  };

  const renderSubject = ({item}: {item: Subject}) => (
    <View style={styles.subjectCard}>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectIcon}>{item.drink_icon}</Text>
        <Text style={styles.subjectName}>{item.name}</Text>
        <TouchableOpacity
          style={styles.deleteSubjectBtn}
          onPress={() => handleDelete(item)}>
          <Icon name="close-circle" size={20} color="#c0392b" />
        </TouchableOpacity>
      </View>

      <View style={styles.timerButtons}>
        <TouchableOpacity
          style={[styles.timerButton, styles.countUpButton]}
          onPress={() => handleTimerSelect(item, 'countup')}>
          <Text style={styles.timerButtonText}>⏱️ Count Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timerButton, styles.pomodoroButton]}
          onPress={() => handleTimerSelect(item, 'pomodoro')}>
          <Text style={styles.timerButtonText}>🍅 Pomodoro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/background.jpg')}
      style={styles.background}
      blurRadius={2}>
      <View style={styles.overlay}>
        {/* Active profile header */}
        {activeProfile && (
          <View style={styles.profileBanner}>
            <Text style={styles.profileBannerAvatar}>
              {activeProfile.avatar}
            </Text>
            <Text style={styles.profileBannerName}>{activeProfile.name}</Text>
          </View>
        )}

        <Text style={styles.title}>📚 Choose Your Study Session</Text>

        {subjects.length === 0 && !showAddSubject && (
          <Text style={styles.emptyText}>
            No subjects yet! Add one below to get started.
          </Text>
        )}

        <FlatList
          data={subjects}
          keyExtractor={item => item.id.toString()}
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
              onPress={() => setShowDrinkPicker(!showDrinkPicker)}>
              <Text style={styles.selectedDrink}>
                Choose drink: {selectedDrink}
              </Text>
            </TouchableOpacity>

            {showDrinkPicker && (
              <View style={styles.drinkPicker}>
                {DRINK_ICONS.map(drink => (
                  <TouchableOpacity
                    key={drink.name}
                    style={styles.drinkOption}
                    onPress={() => {
                      setSelectedDrink(drink.name);
                      setShowDrinkPicker(false);
                    }}>
                    <Text style={styles.drinkIcon}>{drink.name}</Text>
                    <Text style={styles.drinkLabel}>{drink.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
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
            onPress={() => setShowAddSubject(true)}>
            <Icon name="add-circle" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>Add New Subject</Text>
          </TouchableOpacity>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {flex: 1},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139,69,19,0.8)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 10,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  profileBannerAvatar: {fontSize: 20, marginRight: 8},
  profileBannerName: {color: '#fff', fontWeight: 'bold', fontSize: 15},
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  emptyText: {
    color: '#e0d5c5',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
  listContainer: {paddingBottom: 20},
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
  subjectIcon: {fontSize: 36, marginRight: 12},
  subjectName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C3A21',
  },
  deleteSubjectBtn: {padding: 4},
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
  countUpButton: {backgroundColor: '#8B4513'},
  pomodoroButton: {backgroundColor: '#D2691E'},
  timerButtonText: {color: '#FFF', fontSize: 14, fontWeight: 'bold'},
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
    color: '#333',
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
    width: '33%',
    padding: 10,
  },
  drinkIcon: {fontSize: 28},
  drinkLabel: {fontSize: 11, color: '#666', marginTop: 4},
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
  buttonText: {color: '#FFF', fontWeight: 'bold', fontSize: 16},
});
