import type { AppItem, FcmNotificationPayload } from '../types/appStore.ts';

/**
 * Validates Android package name according to Android standards.
 * Format: e.g. com.example.app (at least two segments separated by dots,
 * starting with a letter, alphanumeric + underscores).
 */
export function isValidPackageName(pkg: string): boolean {
  if (!pkg || typeof pkg !== 'string') return false;
  const regex = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;
  return regex.test(pkg.trim());
}

/**
 * Checks if candidate version string is newer than current version string.
 * Supports standard semver like "2.4.1" vs "2.4.0".
 */
export function isNewerVersion(currentVersion: string, candidateVersion: string): boolean {
  if (!currentVersion || !candidateVersion) return false;
  
  const parseParts = (v: string) => 
    v.replace(/^v/i, '').split('.').map(p => parseInt(p, 10) || 0);

  const cur = parseParts(currentVersion);
  const cand = parseParts(candidateVersion);
  
  const maxLength = Math.max(cur.length, cand.length);
  for (let i = 0; i < maxLength; i++) {
    const c = cur[i] || 0;
    const n = cand[i] || 0;
    if (n > c) return true;
    if (n < c) return false;
  }
  return false;
}

/**
 * Formats byte size into human readable string in MB or KB.
 */
export function formatApkSize(bytes: number): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 MB';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Formats download count (e.g. 1500 -> 1.5K+, 50000 -> 50K+)
 */
export function formatDownloads(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M+`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K+`;
  }
  return `${count}`;
}

/**
 * Normalizes package name to safe FCM topic name
 * (FCM topics only accept characters in [a-zA-Z0-9-_.~%])
 */
export function getFcmTopicForPackage(packageName: string): string {
  const safePkg = packageName.replace(/[^a-zA-Z0-9-_.~%]/g, '_');
  return `app_update_${safePkg}`;
}

/**
 * Creates Firebase Cloud Messaging payload for app update broadcasts.
 */
export function createFcmUpdatePayload(
  app: AppItem,
  update: {
    versionName: string;
    versionCode: number;
    changelog: string;
    apkUrl?: string;
    isCritical?: boolean;
  }
): FcmNotificationPayload {
  const topic = getFcmTopicForPackage(app.packageName);
  const isCritical = Boolean(update.isCritical);

  const title = isCritical
    ? `⚠️ Tul bik update: ${app.name} v${update.versionName}`
    : `✨ Update thar a awm e: ${app.name} v${update.versionName}`;

  const body = update.changelog 
    ? `Danglamna: ${update.changelog.slice(0, 100)}${update.changelog.length > 100 ? '...' : ''}`
    : `Version thar v${update.versionName} a chhuak ta. Mizo AppStore atangin download rawh le.`;

  return {
    topic: `/topics/${topic}`,
    notification: {
      title,
      body,
    },
    data: {
      appId: app.id,
      appName: app.name,
      packageName: app.packageName,
      versionCode: update.versionCode.toString(),
      versionName: update.versionName,
      changelog: update.changelog,
      apkUrl: update.apkUrl || app.apkDownloadUrl,
      isCritical: isCritical ? 'true' : 'false',
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Filters and sorts applications
 */
export function filterApps(
  apps: AppItem[],
  query: string,
  category: string,
  sortBy: 'popular' | 'latest' | 'rating' = 'popular'
): AppItem[] {
  let result = apps.filter((app) => {
    const matchesCategory = category === 'all' || !category || app.category === category;
    if (!matchesCategory) return false;

    if (!query || !query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      app.name.toLowerCase().includes(q) ||
      app.packageName.toLowerCase().includes(q) ||
      app.shortDesc.toLowerCase().includes(q) ||
      app.developer.name.toLowerCase().includes(q)
    );
  });

  result.sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    // Default 'popular': downloads count
    return b.downloadsCount - a.downloadsCount;
  });

  return result;
}

/**
 * Generates Android Gradle snippet for Firebase Cloud Messaging
 */
export function generateAndroidGradleSnippet(): string {
  return `// 1. Project-level build.gradle.kts
plugins {
    id("com.google.gms.google-services") version "4.4.2" apply false
}

// 2. App-level build.gradle.kts (:app)
plugins {
    id("com.android.application")
    id("kotlin-android")
    id("com.google.gms.google-services")
}

dependencies {
    // Firebase BoM & Cloud Messaging
    implementation(platform("com.google.firebase:firebase-bom:33.7.0"))
    implementation("com.google.firebase:firebase-messaging-ktx")
    
    // Core Android & Material Components
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("com.google.android.material:material:1.12.0")
}`;
}

/**
 * Generates AndroidManifest.xml snippet
 */
export function generateAndroidManifestSnippet(packageName: string): string {
  return `<!-- AndroidManifest.xml -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${packageName || 'com.example.mizoapp'}">

    <!-- Network leh Notification Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <!-- APK download leh install theih nan (Optional) -->
    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/Theme.MizoApp">

        <!-- Firebase Cloud Messaging Service -->
        <service
            android:name=".services.AppUpdateMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <!-- Notification Icon leh Color default -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@drawable/ic_notification" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/emerald_primary" />

    </application>
</manifest>`;
}

/**
 * Generates Kotlin FirebaseMessagingService snippet
 */
export function generateKotlinServiceSnippet(packageName: string = 'com.example.mizoapp'): string {
  return `package ${packageName}.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import ${packageName}.BuildConfig
import ${packageName}.MainActivity
import ${packageName}.R

class AppUpdateMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Token hi server-ah i dah tha thei ang
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // FCM Data Payload atangin update information lakchhuahna
        val data = remoteMessage.data
        if (data.isNotEmpty()) {
            val newVersionCode = data["versionCode"]?.toIntOrNull() ?: 0
            val newVersionName = data["versionName"] ?: "1.0.0"
            val changelog = data["changelog"] ?: "Siamthat tharte a awm e."
            val apkUrl = data["apkUrl"] ?: "https://mizoappstore.org"
            val isCritical = data["isCritical"]?.toBoolean() ?: false

            // Current installed app version nen intehkhiakna
            val currentVersionCode = BuildConfig.VERSION_CODE

            if (newVersionCode > currentVersionCode) {
                showUpdateNotification(
                    versionName = newVersionName,
                    changelog = changelog,
                    apkUrl = apkUrl,
                    isCritical = isCritical
                )
            }
        }
    }

    private fun showUpdateNotification(
        versionName: String,
        changelog: String,
        apkUrl: String,
        isCritical: Boolean
    ) {
        val channelId = "mizo_app_update_channel"
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Android 8.0 (API 26) chunglam tan Notification Channel siam a tul
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "App Update Notifications",
                if (isCritical) NotificationManager.IMPORTANCE_HIGH else NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Mizo AppStore update thar notification-te"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // APK download-na direct link hawngtu Intent
        val updateIntent = Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl)).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            1001,
            updateIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = if (isCritical) {
            "Tul Bik Update! Version v$versionName"
        } else {
            "Update Thar A Awm E! Version v$versionName"
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText("Danglamna: $changelog")
            .setStyle(NotificationCompat.BigTextStyle().bigText("Danglamna: $changelog\\n\\nUpdate download nan hmet rawh le."))
            .setPriority(if (isCritical) NotificationCompat.PRIORITY_HIGH else NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(!isCritical)
            .addAction(R.drawable.ic_download, "Update Nghal Rawh", pendingIntent)
            .build()

        notificationManager.notify(101, notification)
    }
}`;
}

/**
 * Generates MainActivity Topic subscription snippet
 */
export function generateMainActivitySubscriptionSnippet(packageName: string = 'com.example.mizoapp'): string {
  const safeTopic = getFcmTopicForPackage(packageName);
  return `package ${packageName}

import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.messaging.FirebaseMessaging

class MainActivity : AppCompatActivity() {

    // Android 13 (API 33) tan Notification Permission dilna contract
    private val requestNotificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                subscribeToAppUpdates()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Notification permission endikna
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestNotificationPermission.launch(android.Manifest.permission.POST_NOTIFICATIONS)
        } else {
            subscribeToAppUpdates()
        }
    }

    /**
     * Mizo AppStore FCM topic subscribe-na
     * Hei hian app update thar a chhuah apiangin notification a dawng ang
     */
    private fun subscribeToAppUpdates() {
        val topicName = "${safeTopic}"
        
        FirebaseMessaging.getInstance().subscribeToTopic(topicName)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    // Subscribe a hlawhtling e!
                    // Log.d("FCM", "Subscribed to $topicName successfully")
                }
            }
    }
}`;
}

/**
 * Generates In-App Update Dialog snippet in Kotlin
 */
export function generateInAppUpdateManagerSnippet(): string {
  return `// AppUpdateHelper.kt - Android app chhungah Dialog mawi tak lanna
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.net.Uri

object AppUpdateHelper {

    fun showMizoUpdateDialog(
        context: Context,
        versionName: String,
        changelog: String,
        apkUrl: String,
        isCritical: Boolean
    ) {
        val builder = AlertDialog.Builder(context)
        builder.setTitle(if (isCritical) "Tul Bik Update (v$versionName)" else "Update Thar A Awm E (v$versionName)")
        builder.setMessage("Danglamna tharte:\\n$changelog\\n\\nVersion thar hi i hmang duh em?")
        builder.setCancelable(!isCritical)

        builder.setPositiveButton("Update Nghal Rawh") { dialog, _ ->
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl))
            context.startActivity(intent)
            if (isCritical) {
                dialog.dismiss()
            }
        }

        if (!isCritical) {
            builder.setNegativeButton("Remchan Hunah") { dialog, _ ->
                dialog.dismiss()
            }
        }

        val dialog = builder.create()
        dialog.show()
    }
}`;
}
