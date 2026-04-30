import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../styles/theme';

const API_BASE = 'http://172.25.217.91:5000/api'; 

export default function PRLCoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]); 
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch all courses
      const coursesRes = await fetch(`${API_BASE}/courses`);
      const coursesData = await coursesRes.json();
      setCourses(coursesData);

      // Fetch all lecturers (id + name/email)
      const lecturersRes = await fetch(`${API_BASE}/users?role=lecturer`);
      const lecturersData = await lecturersRes.json();
      const lecturerMap = {};
      lecturersData.forEach(lec => {
        lecturerMap[lec.id] = lec.name || lec.email;
      });
      setLecturers(lecturerMap);

      // Fetch all assignments
      const assignmentsRes = await fetch(`${API_BASE}/assignments`);
      const assignmentsData = await assignmentsRes.json();
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // For each course, get list of assigned lecturer names
  const getLecturersForCourse = (courseId) => {
    const assigned = assignments.filter(ass => ass.courseId === courseId);
    return assigned.map(ass => lecturers[ass.lecturerId] || ass.lecturerId);
  };

  const renderCourseItem = ({ item }) => {
    const assignedLecturers = getLecturersForCourse(item.id);
    return (
      <View style={styles.card}>
        <Text style={styles.courseTitle}>{item.name} ({item.code})</Text>
        <Text style={styles.className}>Class: {item.className || 'Not specified'}</Text>
        <Text style={styles.lecturersLabel}>Assigned Lecturers:</Text>
        {assignedLecturers.length === 0 ? (
          <Text style={styles.noLecturers}>None assigned</Text>
        ) : (
          assignedLecturers.map((name, idx) => (
            <Text key={idx} style={styles.lecturerName}>• {name}</Text>
          ))
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courses & Assigned Lecturers</Text>
      {courses.length === 0 ? (
        <Text style={styles.noData}>No courses found.</Text>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourseItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
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
  className: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 10,
  },
  lecturersLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 5,
    marginBottom: 5,
  },
  lecturerName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    marginBottom: 2,
  },
  noLecturers: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginLeft: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  noData: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 50,
  },
});