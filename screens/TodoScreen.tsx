// screens/TodoScreen.tsx - Following "My Places" pattern
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import baseUrl from '../API/index';

// Simple Todo Item Component
const TodoItem = ({todo, subjectColor, onToggle, onPress}: any) => {
  const getPriorityColor = () => {
    switch (todo.priority) {
      case 'high':
        return '#FF4444';
      case 'medium':
        return '#FFA500';
      case 'low':
        return '#4CAF50';
      default:
        return '#F5F5F5';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.todoItem, {backgroundColor: getPriorityColor()}]}
      onPress={onPress}
      activeOpacity={0.7}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(todo.id, !todo.is_completed)}>
        <Text style={styles.checkboxIcon}>
          {todo.is_completed ? '✅' : '⬜'}
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
          <View
            style={[
              styles.priorityBadge,
              {backgroundColor: getPriorityColor()},
            ]}>
            <Text style={styles.priorityText}>
              {todo.priority === 'high'
                ? '🔴 High'
                : todo.priority === 'medium'
                ? '🟠 Medium'
                : '🟢 Low'}
            </Text>
          </View>
        )}
        {todo.due_date && (
          <Text style={styles.dueDate}>
            📅 {new Date(todo.due_date).toLocaleDateString()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Add Task Modal (full taskDetails: title, description, priority, due_date)
const AddTaskModal = ({visible, subject, onClose, onAdd}: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('no');
  const [dueDate, setDueDate] = useState('');

  const handleAdd = () => {
    if (!title.trim()) {
      ToastAndroid.show('Please enter a task title', ToastAndroid.SHORT);
      return;
    }
    onAdd({
      title: title.trim(),
      description: description.trim() || null,
      subject_id: subject.subject_id,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    });
    setTitle('');
    setDescription('');
    setPriority('no');
    setDueDate('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.addModal,
            {borderTopColor: subject?.color || '#8B4513'},
          ]}>
          <Text style={styles.addModalTitle}>
            Add Task to {subject?.drink_icon} {subject?.subject_name}
          </Text>

          <TextInput
            style={styles.taskInput}
            placeholder="Enter task title..."
            value={title}
            onChangeText={setTitle}
            autoFocus
          />

          <TextInput
            style={[styles.taskInput, styles.textArea]}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.priorityContainer}>
            <Text style={styles.pickerLabel}>Priority</Text>
            <View style={styles.priorityOptions}>
              {['no', 'low', 'medium', 'high'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && styles.priorityOptionSelected,
                  ]}
                  onPress={() => setPriority(p)}>
                  <Text style={{fontSize: 12, fontWeight: '600'}}>
                    {p === 'no'
                      ? '⚪'
                      : p === 'low'
                      ? '🟢'
                      : p === 'medium'
                      ? '🟠'
                      : '🔴'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={styles.taskInput}
            placeholder="Due date (YYYY-MM-DD)"
            value={dueDate}
            onChangeText={setDueDate}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, {backgroundColor: subject?.color}]}
              onPress={handleAdd}>
              <Text style={styles.addBtnText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Todo Detail Modal (like ViewScreen) - with Start Timer button
const TodoDetailModal = ({
  visible,
  todo,
  onClose,
  onDelete,
  onEdit,
  onStartTimer,
}: any) => {
  if (!todo) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.detailModal,
            {borderTopColor: todo.subject_color || '#8B4513'},
          ]}>
          <View style={styles.detailHeader}>
            <Text style={styles.subjectIcon}>{todo.subject_icon}</Text>
            <Text style={styles.subjectName}>{todo.subject_name}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.detailTitle}>{todo.title}</Text>

          {todo.priority !== 'no' && (
            <View
              style={[
                styles.detailPriority,
                {
                  backgroundColor:
                    todo.priority === 'high'
                      ? '#FF4444'
                      : todo.priority === 'medium'
                      ? '#FFA500'
                      : '#4CAF50',
                },
              ]}>
              <Text style={styles.detailPriorityText}>
                {todo.priority === 'high'
                  ? '🔴 High Priority'
                  : todo.priority === 'medium'
                  ? '🟠 Medium Priority'
                  : '🟢 Low Priority'}
              </Text>
            </View>
          )}

          {todo.description && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailText}>{todo.description}</Text>
            </View>
          )}

          {todo.due_date && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Due Date</Text>
              <Text style={styles.detailText}>
                📅 {new Date(todo.due_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.detailActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.timerBtn]}
              onPress={onStartTimer}>
              <Ionicons name="timer-outline" size={20} color="white" />
              <Text style={styles.actionBtnText}>Timer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={onEdit}>
              <Ionicons name="create-outline" size={20} color="white" />
              <Text style={styles.actionBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={styles.actionBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Edit Todo Modal (like EditScreen)
const EditTodoModal = ({visible, todo, subjects, onClose, onSave}: any) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState(null);
  const [priority, setPriority] = useState('no');
  const [dueDate, setDueDate] = useState<Date | null>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || '');
      setDescription(todo.description || '');
      setSubjectId(todo.subject_id);
      setPriority(todo.priority || 'no');
      setDueDate(todo.due_date ? new Date(todo.due_date) : null);
    }
  }, [todo]);

  const handleSave = () => {
    if (!title.trim()) {
      ToastAndroid.show('Please enter a title', ToastAndroid.SHORT);
      return;
    }
    onSave({
      title: title.trim(),
      description,
      subject_id: subjectId,
      priority,
      due_date: dueDate ? dueDate.toISOString() : null,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.editModal}>
          <Text style={styles.editModalTitle}>✏️ Edit Task</Text>

          <TextInput
            style={styles.editInput}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.editInput, styles.textArea]}
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Subject</Text>
            {subjects.map((sub: any) => (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subjectOption,
                  subjectId === sub.id && styles.subjectOptionSelected,
                ]}
                onPress={() => setSubjectId(sub.id)}>
                <Text>
                  {sub.drink_icon} {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.priorityContainer}>
            <Text style={styles.pickerLabel}>Priority</Text>
            <View style={styles.priorityOptions}>
              {['no', 'low', 'medium', 'high'].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && styles.priorityOptionSelected,
                  ]}
                  onPress={() => setPriority(p)}>
                  <Text>
                    {p === 'no'
                      ? '⚪ No'
                      : p === 'low'
                      ? '🟢 Low'
                      : p === 'medium'
                      ? '🟠 Medium'
                      : '🔴 High'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main TodoScreen (like HomeScreen)
export default function TodoScreen({navigation}: any) {
  const [groupedTodos, setGroupedTodos] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Fetch subjects for dropdown
  const fetchSubjects = () => {
    fetch(baseUrl + '/api/subjects')
      .then(res => res.json())
      .then(data => {
        setSubjects(data);
        // After fetching subjects, merge with todos
        mergeSubjectsWithTodos(data);
      })
      .catch(console.error);
  };

  // Merge subjects with todos so all subjects display even with no todos
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

        // For each subject, add it to the map if not already there
        const mergedData = subjectsData.map(subject => {
          if (todosMap.has(subject.id)) {
            return todosMap.get(subject.id);
          }
          // If no todos, return subject with empty todos array
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
    fetchSubjects(); // This will fetch subjects and merge with todos
  }, []);

  // Add todo with full taskDetails (title, description, subject_id, priority, due_date)
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
          fetchSubjects(); // Refresh with merge
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
            isCompleted ? '✅ Task completed!' : '📝 Task reopened',
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
          fetchSubjects(); // Refresh with merge
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
          fetchSubjects(); // Refresh with merge
          setDetailModalVisible(false);
        }
      })
      .catch(console.error);
  };

  // Start timer for the selected task
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
          <Ionicons name="add" size={18} color="white" />
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
          <Text style={styles.emptyStateText}>
            No tasks yet. Tap "Add" to add one!
          </Text>
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

      {/* Add Task Modal */}
      <AddTaskModal
        visible={addModalVisible}
        subject={selectedSubject}
        onClose={() => setAddModalVisible(false)}
        onAdd={addTodo}
      />

      {/* Todo Detail Modal */}
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

      {/* Edit Todo Modal */}
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
  checkboxIcon: {
    fontSize: 22,
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
    color: '#94A3B8',
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
    fontSize: 10,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    borderTopWidth: 5,
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  taskInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '600',
  },
  addBtn: {
    flex: 1,
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  detailModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    borderTopWidth: 5,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  detailPriority: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  detailPriorityText: {
    color: 'white',
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailText: {
    fontSize: 15,
    color: '#1E293B',
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  timerBtn: {
    backgroundColor: '#7C3AED',
  },
  editBtn: {
    backgroundColor: '#2563EB',
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
  },
  actionBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  editModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  subjectOption: {
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 4,
  },
  subjectOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
  priorityContainer: {
    marginBottom: 16,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityOptionSelected: {
    backgroundColor: '#DBEAFE',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: '600',
  },
});
