import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { auth } from '../../config/firebaseConfig';
import { colors } from '../../styles/theme';

const API_BASE = 'http://172.25.217.91:5000/api';

export default function ViewRatingsScreen() {
  const [ratings, setRatings] = useState([]);
  const [lecturers, setLecturers] = useState([]); 
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // 1. Get user role
      const roleRes = await fetch(`${API_BASE}/users/${user.uid}`);
      const userData = await roleRes.json();
      const role = userData.role;
      setUserRole(role);

      // 2. Fetch all lecturers (id + name/email)
      const lecturersRes = await fetch(`${API_BASE}/users?role=lecturer`);
      const lecturersList = await lecturersRes.json();
      const lecturerMap = {};
      lecturersList.forEach(lec => {
        lecturerMap[lec.id] = lec.name || lec.email;
      });
      setLecturers(lecturerMap);

      // 3. Fetch ratings (filtered if lecturer)
      let ratingsUrl = `${API_BASE}/ratings/all`;
      if (role === 'lecturer') {
        ratingsUrl += `?lecturerId=${user.uid}`;
      }
      const ratingsRes = await fetch(ratingsUrl);
      const ratingsData = await ratingsRes.json();
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group ratings by lecturer
  const groupByLecturer = () => {
    const map = new Map();
    ratings.forEach(r => {
      const lecturerName = lecturers[r.lecturerId] || r.lecturerId;
      if (!map.has(r.lecturerId)) {
        map.set(r.lecturerId, { 
          lecturerId: r.lecturerId,
          lecturerName: lecturerName,
          total: 0, 
          count: 0 
        });
      }
      const entry = map.get(r.lecturerId);
      entry.total += r.rating;
      entry.count += 1;
    });
    return Array.from(map.values()).map(item => ({
      lecturerName: item.lecturerName,
      avgRating: (item.total / item.count).toFixed(1),
      totalRatings: item.count,
    }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.lecturerName}>{item.lecturerName}</Text>
      <Text style={styles.rating}>⭐ Average Rating: {item.avgRating} / 5</Text>
      <Text style={styles.count}>Based on {item.totalRatings} rating(s)</Text>
    </View>
  );

  const grouped = groupByLecturer();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {userRole === 'lecturer' ? 'Your Ratings' : 'Lecturer Ratings'}
      </Text>
      {grouped.length === 0 ? (
        <Text style={styles.noData}>No ratings available.</Text>
      ) : (
        <FlatList data={grouped} keyExtractor={(item, index) => index.toString()} renderItem={renderItem} />
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
    fontSize: 28,
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
  lecturerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  rating: {
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 5,
  },
  count: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 3,
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