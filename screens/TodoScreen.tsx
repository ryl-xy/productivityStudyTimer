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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import baseUrl from '../API/index';
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
          <View style={[styles.priorityBadge, ,]}>
            <Text style={[styles.priorityText, {color: getPriorityColor()}]}>
              {todo.priority === 'high'
                ? 'High Priority'
                : todo.priority === 'medium'
                ? 'Medium Priority'
                : 'Low Priority'}
            </Text>
          </View>
        )}
        {todo.due_date && (
          <Text style={styles.dueDate}>
            {new Date(todo.due_date).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

//TodoScreen
export default function TodoScreen({navigation}: any) {
  const [groupedTodos, setGroupedTodos] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);

  const fetchSubjects = () => {
    fetch(baseUrl + '/api/subjects')
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        mergeSubjectsWithTodos(data);
      })
      .catch(console.error);
  };

  const mergeSubjectsWithTodos = (subjectsData: any[]) => {
    fetch(baseUrl + '/api/todos', {
      method: 'GET',
      headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
    })
      .then(response => response.json())
      .then(todosData => {
        // Create a map of todos by subject_id
        const todosMap = new Map();
        todosData.forEach((group: any) => {
          todosMap.set(group.subject_id, group);
        });

        const mergedData = subjectsData.map(subject => {
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
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

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
          fetchSubjects();
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
          fetchSubjects(); // Refresh with merge
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
          fetchSubjects();
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
          fetchSubjects();
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
          <Text style={styles.emptyStateText}>Tap "Add" to add one.</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        refreshing={isFetching}
        onRefresh={() => {
          setIsFetching(true);
          fetchSubjects();
          setIsFetching(false);
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
        subjects={subjects}
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
    backgroundColor: '#F1F5F9',
  },
  list: {
    padding: 12,
    paddingBottom: 80,
  },
  subjectSection: {
    marginBottom: 16,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 2,
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
    color: '#1E293B',
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
    backgroundColor: 'white',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 10,
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
    color: '#1E293B',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#b8c1cf',
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dueDate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: 'white',
    marginHorizontal: 8,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#94A3B8',
    fontSize: 13,
  },
});
