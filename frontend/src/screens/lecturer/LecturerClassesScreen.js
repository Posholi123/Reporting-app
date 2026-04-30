import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { auth } from '../../config/firebaseConfig';
import { colors } from '../../styles/theme';
import { fetchAssignments, fetchCourses, fetchClasses, createClass } from '../../services/api';

export default function LecturerClassesScreen() {
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [classTopic, setClassTopic] = useState('');
  const [classDate, setClassDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch assigned courses (courses where lecturer is assigned)
  const loadAssignedCourses = async (lecturerId) => {
    try {
      // Get assignments for this lecturer
      const assignments = await fetchAssignments(lecturerId);
      const courseIds = assignments.map(ass => ass.courseId);
      if (courseIds.length === 0) return [];
      // Get all courses and filter those assigned to lecturer
      const allCourses = await fetchCourses();
      return allCourses.filter(course => courseIds.includes(course.id));
    } catch (error) {
      console.error('Error fetching assigned courses:', error);
      return [];
    }
  };

  const loadMyClasses = async (lecturerId) => {
    try {
      const data = await fetchClasses(lecturerId);
      return data;
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  };

  const loadData = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'No user logged in');
      setLoading(false);
      return;
    }
    const courses = await loadAssignedCourses(user.uid);
    const classesList = await loadMyClasses(user.uid);
    setAssignedCourses(courses);
    setClasses(classesList);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createClassHandler = async () => {
    if (!selectedCourseId || !classTopic || !classDate) {
      Alert.alert('Error', 'Please select a course, enter topic and date');
      return;
    }
    const user = auth.currentUser;
    const course = assignedCourses.find(c => c.id === selectedCourseId);
    if (!course) {
      Alert.alert('Error', 'Selected course not found');
      return;
    }
    try {
      const newClass = {
        lecturerId: user.uid,
        lecturerName: user.email,
        courseId: selectedCourseId,
        courseName: course.name,
        courseCode: course.code,
        className: course.className,
        topic: classTopic,
        date: classDate,
      };
      await createClass(newClass);
      Alert.alert('Success', 'Class created successfully');
      setSelectedCourseId('');
      setClassTopic('');
      setClassDate('');
      loadData(); // refresh
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manage Classes</Text>

      <Text style={styles.subtitle}>Your Assigned Courses</Text>
      {assignedCourses.length === 0 ? (
        <Text style={styles.whiteText}>No courses assigned yet. Contact Program Leader.</Text>
      ) : (
        assignedCourses.map(course => (
          <TouchableOpacity
            key={course.id}
            style={[styles.selectorButton, selectedCourseId === course.id && styles.selectedButton]}
            onPress={() => setSelectedCourseId(course.id)}
          >
            <Text style={styles.selectorButtonText}>
              {course.name} ({course.code}) - {course.className || 'No class'}
            </Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.subtitle}>Create New Class</Text>
      <TextInput
        style={styles.input}
        placeholder="Topic (e.g., Introduction to React Native)"
        placeholderTextColor={colors.textMuted}
        value={classTopic}
        onChangeText={setClassTopic}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor={colors.textMuted}
        value={classDate}
        onChangeText={setClassDate}
      />
      <TouchableOpacity style={styles.actionButton} onPress={createClassHandler} disabled={!selectedCourseId}>
        <Text style={styles.buttonText}> Create Class</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Your Classes</Text>
      {classes.length === 0 ? (
        <Text style={styles.whiteText}>No classes created yet.</Text>
      ) : (
        classes.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.courseTitle}>Course: {item.courseName} ({item.courseCode})</Text>
            <Text style={styles.whiteText}>Class Group: {item.className}</Text>
            <Text style={styles.whiteText}>Topic: {item.topic}</Text>
            <Text style={styles.whiteText}>Date: {item.date}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  selectorButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedButton: {
    backgroundColor: colors.buttonHover,
    borderColor: colors.textPrimary,
  },
  selectorButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});