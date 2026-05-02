import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  Modal,
  TextInput,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import baseUrl from '../API/index';
import {useProfile} from '../context/profileContext';
import {AddTaskModal, EditTodoModal} from '../components/TaskModal';
import {TodoDetailModal} from '../components/TodoDetailModal';

const TodoItem = ({todo, subjectColor, onToggle, onPress}: any) => {
  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high':
        return '#f58a8a';
      case 'medium':
        return '#f0d39b';
      case 'low':
        return '#b2d0b3';
      default:
        return '#F5F5F5';
    }
  };

  return (
    <TouchableOpacity style={[styles.todoItem]} onPress={onPress}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(todo.id, !todo.is_completed)}>
        <Text>
          {todo.is_completed ? (
            <FontAwesome name="check-square-o" size={24} />
          ) : (
            <FontAwesome name="square-o" size={24} />
          )}
        </Text>
      </TouchableOpacity>

      <View style={styles.todoContent}>
        <Text
          style={[
            styles.todoTitle,
            todo.is_completed && styles.completedTitle,
          ]}>
          {todo.title}
        </Text>
        {todo.priority !== 'no' && (
          <Text style={[styles.priorityText, {color: getPriorityColor()}]}>
            {todo.priority === 'high'
              ? 'High Priority'
              : todo.priority === 'medium'
              ? 'Medium Priority'
              : 'Low Priority'}
          </Text>
        )}
        {todo.due_date && (
          <Text style={styles.dueDate}>
            Due Date :{new Date(todo.due_date).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

//TodoScreen
export default function TodoScreen({navigation}: any) {
  const {activeProfile} = useProfile();
  const [groupedTodos, setGroupedTodos] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<any>(null);

  const fetchSubjectsAndTodos = async () => {
    if (!activeProfile) {
      setGroupedTodos([]);
      return;
    }

    try {
      setIsFetching(true);

      // Fetch todos for all subjects in the active profile
      const response = await fetch(baseUrl + '/api/todos', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const todosData = await response.json();

      // Map todos by subject_id
      const todosMap = new Map();
      (Array.isArray(todosData) ? todosData : []).forEach((group: any) => {
        todosMap.set(group.subject_id, group);
      });

      // Build grouped data only for subjects in active profile
      const mergedData = (activeProfile.subjects || []).map(subject => {
        if (todosMap.has(subject.id)) {
          return todosMap.get(subject.id);
        }
        return {
          subject_id: subject.id,
          subject_name: subject.name,
          drink_icon: subject.drink_icon,
          color: subject.color,
          todos: [],
        };
      });

      setGroupedTodos(mergedData);
    } catch (error) {
      console.error('Error fetching todos:', error);
      ToastAndroid.show('Failed to load todos', ToastAndroid.SHORT);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchSubjectsAndTodos();
  }, [activeProfile]);

  const addTodo = (taskDetails: any) => {
    fetch(baseUrl + '/api/todos', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(taskDetails),
    })
      .then(response => response.json())
      .then(data => {
        if (data.affected > 0) {
          ToastAndroid.show('Task added!', ToastAndroid.SHORT);
          fetchSubjectsAndTodos();
        }
      })
      .catch(error => console.error('Error:', error));
  };

  // Toggle todo completion
  const toggleTodo = (id: any, isCompleted: any) => {
    fetch(baseUrl + '/api/todos/' + id + '/toggle', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({is_completed: isCompleted}),
    })
      .then(response => response.json())
      .then(data => {
        if (data.affected > 0) {
          fetchSubjectsAndTodos();
          ToastAndroid.show(
            isCompleted ? 'Task completed!' : 'Task reopened',
            ToastAndroid.SHORT,
          );
        }
      })
      .catch(console.error);
  };

  // Update todo
  const updateTodo = (id: any, todoData: any) => {
    fetch(baseUrl + '/api/todos/' + id, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({...todoData, id}),
    })
      .then(response => response.json())
      .then(data => {
        if (data.affected > 0) {
          ToastAndroid.show('Task updated!', ToastAndroid.SHORT);
          fetchSubjectsAndTodos();
        }
      })
      .catch(console.error);
  };

  // Delete todo
  const deleteTodo = (id: any) => {
    fetch(baseUrl + '/api/todos/' + id, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(data => {
        if (data.affected > 0) {
          ToastAndroid.show('Task deleted', ToastAndroid.SHORT);
          fetchSubjectsAndTodos();
          setDetailModalVisible(false);
        }
      })
      .catch(console.error);
  };

  const startTimerForTask = () => {
    if (selectedTodo) {
      setDetailModalVisible(false);
      navigation.navigate('TimerFlow', {
        screen: 'CountUpTimer',
        params: {
          subjectName: selectedTodo.subject_name,
          taskId: selectedTodo.id,
          taskName: selectedTodo.title,
        },
      });
    }
  };

  const renderSubject = ({item: subject}: any) => (
    <View style={styles.subjectSection}>
      <View style={[styles.subjectHeader, {borderLeftColor: subject.color}]}>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectIcon}>{subject.drink_icon}</Text>
          <Text style={styles.subjectName}>{subject.subject_name}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addTaskBtn, {backgroundColor: subject.color}]}
          onPress={() => {
            setSelectedSubject(subject);
            setAddModalVisible(true);
          }}>
          <Icon name="add" size={18} color="white" />
          <Text style={styles.addTaskBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {subject.todos.length > 0 ? (
        subject.todos.map((todo: any) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            subjectColor={subject.color}
            onToggle={toggleTodo}
            onPress={() => {
              setSelectedTodo({
                ...todo,
                subject_icon: subject.drink_icon,
                subject_color: subject.color,
              });
              setDetailModalVisible(true);
            }}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Tap "Add" to add todo.</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        refreshing={isFetching}
        onRefresh={() => {
          fetchSubjectsAndTodos();
        }}
        data={groupedTodos}
        renderItem={renderSubject}
        keyExtractor={item => item.subject_id.toString()}
        contentContainerStyle={styles.list}
      />

      <AddTaskModal
        visible={addModalVisible}
        subject={selectedSubject}
        onClose={() => setAddModalVisible(false)}
        onAdd={addTodo}
      />

      <TodoDetailModal
        visible={detailModalVisible}
        todo={selectedTodo}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedTodo(null);
        }}
        onDelete={() => {
          Alert.alert('Delete Task', `Delete "${selectedTodo?.title}"?`, [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteTodo(selectedTodo?.id),
            },
          ]);
        }}
        onEdit={() => {
          setDetailModalVisible(false);
          setEditModalVisible(true);
        }}
        onStartTimer={startTimerForTask}
      />

      <EditTodoModal
        visible={editModalVisible}
        todo={selectedTodo}
        subjects={activeProfile?.subjects || []}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedTodo(null);
        }}
        onSave={(todoData: any) => updateTodo(selectedTodo?.id, todoData)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fdf6e3',
  },
  list: {
    padding: 14,
    paddingBottom: 80,
  },
  subjectSection: {
    marginBottom: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff8dc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: '#8b4513',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectIcon: {
    fontSize: 28,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5c2d0a',
  },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  addTaskBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffdf5',
    padding: 12,
    marginHorizontal: 6,
    marginVertical: 4,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#8b4513',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.07,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f0dbb8',
  },
  checkbox: {
    marginRight: 12,
  },
  todoContent: {
    flex: 1,
  },
  todoTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3d1f05',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#c4a882',
  },
  priorityText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 11,
    color: '#a07850',
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: '#fff8dc',
    marginHorizontal: 6,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0dbb8',
  },
  emptyStateText: {
    color: '#c4a882',
    fontSize: 13,
  },
});
