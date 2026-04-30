import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../styles/theme';

const API_BASE = 'http://172.25.217.91:5000/api'; 

export default function AssignLecturerScreen() {
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const fetchLecturers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users?role=lecturer`);
      const data = await response.json();
      setLecturers(data);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      Alert.alert('Error', 'Failed to load lecturers');
    }
  };

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

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE}/assignments`);
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      Alert.alert('Error', 'Failed to load assignments');
    }
  };

  useEffect(() => {
    fetchLecturers();
    fetchCourses();
    fetchAssignments();
  }, []);

  const assignLecturer = async () => {
    if (!selectedLecturer || !selectedCourse) {
      Alert.alert('Error', 'Select a lecturer and a course');
      return;
    }
    // Check for duplicate
    const alreadyAssigned = assignments.find(
      a => a.lecturerId === selectedLecturer && a.courseId === selectedCourse
    );
    if (alreadyAssigned) {
      Alert.alert('Already assigned', 'This lecturer is already assigned to this course');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lecturerId: selectedLecturer,
          courseId: selectedCourse,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Lecturer assigned');
        fetchAssignments(); // refresh
        setSelectedLecturer('');
        setSelectedCourse('');
      } else {
        throw new Error(data.error || 'Assignment failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const unassign = async (assignmentId) => {
    try {
      const response = await fetch(`${API_BASE}/assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Removed', 'Assignment removed');
        fetchAssignments();
      } else {
        throw new Error(data.error || 'Unassign failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const getLecturerName = (id) => {
    const lec = lecturers.find(l => l.id === id);
    return lec ? lec.name || lec.email : id;
  };

  const getCourseDetails = (id) => {
    const course = courses.find(c => c.id === id);
    return course ? `${course.name} (${course.code}) - ${course.className || 'No class'}` : id;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assign Lecturer to Course</Text>

      <Text style={styles.label}>Select Lecturer:</Text>
      {lecturers.map(lec => (
        <TouchableOpacity
          key={lec.id}
          style={[styles.selectorButton, selectedLecturer === lec.id && styles.selectedButton]}
          onPress={() => setSelectedLecturer(lec.id)}
        >
          <Text style={styles.whiteText}>{lec.name || lec.email}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Select Course:</Text>
      {courses.map(crs => (
        <TouchableOpacity
          key={crs.id}
          style={[styles.selectorButton, selectedCourse === crs.id && styles.selectedButton]}
          onPress={() => setSelectedCourse(crs.id)}
        >
          <Text style={styles.whiteText}>{getCourseDetails(crs.id)}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.actionButton} onPress={assignLecturer}>
        <Text style={styles.whiteButtonText}>🔗 Assign</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Current Assignments</Text>
      {assignments.map(ass => (
        <View key={ass.id} style={styles.card}>
          <Text style={styles.whiteText}>Lecturer: {getLecturerName(ass.lecturerId)}</Text>
          <Text style={styles.whiteText}>Course: {getCourseDetails(ass.courseId)}</Text>
          <TouchableOpacity style={styles.dangerButton} onPress={() => unassign(ass.id)}>
            <Text style={styles.whiteButtonText}>Unassign</Text>
          </TouchableOpacity>
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 5,
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
  whiteText: {
    color: '#FFFFFF',
    marginBottom: 3,
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
  dangerButton: {
    backgroundColor: colors.danger,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.header,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
});