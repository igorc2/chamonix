import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native'
import { supabase } from '../../lib/supabase'

// Define the Todo type
interface Todo {
  id: number
  created_at: string
  title: string
  is_complete: boolean
  user_id: string | null
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos()
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('todos')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'todos' },
          (payload) => {
            console.log('Change received!', payload)
            fetchTodos()
          }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchTodos() {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setTodos(data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function addTodo() {
    if (!newTodo.trim()) return

    try {
      const { error } = await supabase
        .from('todos')
        .insert([{ title: newTodo, is_complete: false }])

      if (error) throw error
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  async function toggleTodo(id: number, is_complete: boolean) {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_complete: !is_complete })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newTodo}
          onChangeText={setNewTodo}
          placeholder="Add a new todo"
        />
        <Button title="Add" onPress={addTodo} />
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.todoItem}>
              <Button
                title={item.is_complete ? "✓" : "○"}
                onPress={() => toggleTodo(item.id, item.is_complete)}
              />
              <Text style={[
                styles.todoText,
                item.is_complete && styles.completedTodo
              ]}>
                {item.title}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  todoText: {
    marginLeft: 10,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
}) 