import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../styles/theme';

const API_BASE = 'http://172.25.217.91:5000/api'; 

export default function AddCourseScreen() {
  const [courses, setCourses] = useState([]);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newClassName, setNewClassName] = useState('');

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE}/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Error', 'Failed to load courses');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const addCourse = async () => {
    if (!newCourseName || !newCourseCode || !newClassName) {
      Alert.alert('Error', 'Please enter course name, code, and class name');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCourseName,
          code: newCourseCode,
          className: newClassName,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Course added');
        setNewCourseName('');
        setNewCourseCode('');
        setNewClassName('');
        fetchCourses(); // refresh list
      } else {
        throw new Error(data.error || 'Failed to add course');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Course</Text>
      <TextInput
        style={styles.input}
        placeholder="Course Name (e.g., Mobile Dev)"
        placeholderTextColor="#8E9AAF"
        value={newCourseName}
        onChangeText={setNewCourseName}
      />
      <TextInput
        style={styles.input}
        placeholder="Course Code (e.g., CS301)"
        placeholderTextColor="#8E9AAF"
        value={newCourseCode}
        onChangeText={setNewCourseCode}
      />
      <TextInput
        style={styles.input}
        placeholder="Class Name (e.g., BSCSMY3)"
        placeholderTextColor="#8E9AAF"
        value={newClassName}
        onChangeText={setNewClassName}
      />
      <TouchableOpacity style={styles.actionButton} onPress={addCourse}>
        <Text style={styles.whiteButtonText}> Add Course</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>All Courses</Text>
      {courses.map(course => (
        <View key={course.id} style={styles.card}>
          <Text style={styles.courseTitle}>{course.name} ({course.code})</Text>
          <Text style={styles.whiteText}>Class: {course.className || 'Not specified'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.header,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 10,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  whiteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: colors.header,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 5,
  },
  whiteText: {
    color: '#FFFFFF',
    marginBottom: 3,
  },
});