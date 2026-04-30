import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { auth } from '../../config/firebaseConfig';
import { colors } from '../../styles/theme';

const API_BASE = 'http://172.25.217.91:5000/api';

export default function StudentRatingScreen() {
  const [lecturers, setLecturers] = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch all assignments to get active lecturer IDs
  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE}/assignments`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  };

  const fetchLecturers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users?role=lecturer`);
      let allLecturers = await response.json();
      // Get active lecturer IDs from assignments
      const assignments = await fetchAssignments();
      const activeLecturerIds = new Set(assignments.map(a => a.lecturerId));
      // Filter lecturers who have at least one assignment
      const activeLecturers = allLecturers.filter(lec => activeLecturerIds.has(lec.id));
      setLecturers(activeLecturers);
      return activeLecturers;
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      Alert.alert('Error', 'Failed to load lecturers');
      return [];
    }
  };

  const fetchMyRatings = async (studentId, lecturersList) => {
    try {
      const response = await fetch(`${API_BASE}/ratings/${studentId}`);
      const ratingsData = await response.json();
      const ratingMap = {};
      lecturersList.forEach(lec => {
        const found = ratingsData.find(r => r.lecturerId === lec.id);
        ratingMap[lec.id] = found ? found.rating : null;
      });
      setRatings(ratingMap);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      Alert.alert('Error', 'Failed to load ratings');
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
    const activeLecturers = await fetchLecturers();
    if (activeLecturers.length > 0) {
      await fetchMyRatings(user.uid, activeLecturers);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const increaseRating = async (lecturerId, currentRating) => {
    const user = auth.currentUser;
    if (!user) return;

    let newRating;
    if (currentRating === null) {
      newRating = 1;
    } else if (currentRating < 5) {
      newRating = currentRating + 1;
    } else {
      Alert.alert('Max rating', 'You already gave 5 stars to this lecturer');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          lecturerId: lecturerId,
          rating: newRating
        })
      });
      if (response.ok) {
        setRatings(prev => ({ ...prev, [lecturerId]: newRating }));
      } else {
        throw new Error('Rating save failed');
      }
    } catch (error) {
      console.error('Error saving rating:', error);
      Alert.alert('Error', 'Failed to save rating');
    }
  };

  const renderLecturer = ({ item }) => {
    const currentRating = ratings[item.id];
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name || item.email}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingLabel}>Your rating: </Text>
          <Text style={styles.ratingValue}>
            {currentRating ? `${currentRating} / 5` : 'Not rated yet'}
          </Text>
          {currentRating !== null && currentRating === 5 ? (
            <Text style={styles.maxText}>⭐ Max rating</Text>
          ) : (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => increaseRating(item.id, currentRating)}
            >
              <Text style={styles.rateButtonText}>Rate +</Text>
            </TouchableOpacity>
          )}
        </View>
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
      <Text style={styles.title}>Rate Your Lecturers</Text>
      {lecturers.length === 0 ? (
        <Text style={styles.noData}>No lecturers with assigned courses found.</Text>
      ) : (
        <FlatList
          data={lecturers}
          keyExtractor={(item) => item.id}
          renderItem={renderLecturer}
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
    fontSize: 26,
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
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    flexWrap: 'wrap',
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.textMuted,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginHorizontal: 5,
  },
  rateButton: {
    backgroundColor: colors.buttonBg,
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rateButtonText: {
    color: '#FEFCFB',
    fontWeight: 'bold',
  },
  maxText: {
    color: colors.success,
    fontWeight: 'bold',
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