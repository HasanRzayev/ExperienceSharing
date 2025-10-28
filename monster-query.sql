-- ============================================
-- 🗑️ MONSTER ASP.NET - DATABASE SIFIRLAMA
-- ============================================
-- Bu query Monster ASP.NET SQL panel-ine yapışdırın və çalıştırın
-- DROP komutu kullanmaz - GÜVENLİ
-- ============================================

-- Tüm verileri sil (foreign key sırasına dikkat)
DELETE FROM CommentReactions;
DELETE FROM Comments;
DELETE FROM Likes;
DELETE FROM ExperienceTags;
DELETE FROM ExperienceImages;
DELETE FROM Experiences;
DELETE FROM Notifications;
DELETE FROM Follows;
DELETE FROM FollowRequests;
DELETE FROM Messages;
DELETE FROM BlockedUsers;
DELETE FROM StatusViews;
DELETE FROM Statuses;
DELETE FROM DeviceLinks;
DELETE FROM DeviceSessions;
DELETE FROM SavedExperiences;
DELETE FROM Collections;
DELETE FROM ExperienceRatings;
DELETE FROM RatingHelpfuls;
DELETE FROM TripExperiences;
DELETE FROM Trips;
DELETE FROM GroupMessages;
DELETE FROM GroupMembers;
DELETE FROM GroupChats;
DELETE FROM EventAttendees;
DELETE FROM Events;
DELETE FROM ExperienceCollaborators;

-- Users tablosunu temizle (admin hariç)
DELETE FROM Users WHERE Email != 'admin@wanderly.com';

-- Tags tablosunu temizle
DELETE FROM Tags;

-- ============================================
-- ✅ TAMAMLANDI
-- ============================================
-- Şimdi Application-i restart edin
-- Seed data avtomatik yüklənəcək
-- ============================================

