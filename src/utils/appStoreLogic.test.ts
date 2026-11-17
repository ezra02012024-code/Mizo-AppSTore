import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidPackageName,
  isNewerVersion,
  formatApkSize,
  formatDownloads,
  getFcmTopicForPackage,
  createFcmUpdatePayload,
  filterApps,
} from './appStoreLogic.ts';
import type { AppItem } from '../types/appStore.ts';

test('isValidPackageName validates Android package names correctly', () => {
  assert.equal(isValidPackageName('com.mizo.app'), true);
  assert.equal(isValidPackageName('org.mizobible.reader'), true);
  assert.equal(isValidPackageName('in.gov.mizoram.rural_app'), true);
  assert.equal(isValidPackageName('invalidpackage'), false);
  assert.equal(isValidPackageName('123.com.test'), false);
  assert.equal(isValidPackageName('com.'), false);
  assert.equal(isValidPackageName(''), false);
});

test('isNewerVersion compares semver versions accurately', () => {
  assert.equal(isNewerVersion('1.0.0', '1.0.1'), true);
  assert.equal(isNewerVersion('1.0.0', '1.1.0'), true);
  assert.equal(isNewerVersion('1.9.5', '2.0.0'), true);
  assert.equal(isNewerVersion('v2.1.0', 'v2.2.0'), true);
  assert.equal(isNewerVersion('2.0.0', '2.0.0'), false);
  assert.equal(isNewerVersion('2.1.0', '2.0.9'), false);
});

test('formatApkSize formats bytes to human readable sizes', () => {
  assert.equal(formatApkSize(0), '0 MB');
  assert.equal(formatApkSize(500 * 1024), '500.0 KB');
  assert.equal(formatApkSize(18.5 * 1024 * 1024), '18.5 MB');
  assert.equal(formatApkSize(1024 * 1024), '1.0 MB');
});

test('formatDownloads formats download count nicely', () => {
  assert.equal(formatDownloads(250), '250');
  assert.equal(formatDownloads(1500), '1.5K+');
  assert.equal(formatDownloads(25000), '25.0K+');
  assert.equal(formatDownloads(1200000), '1.2M+');
});

test('getFcmTopicForPackage cleans illegal characters for FCM topics', () => {
  assert.equal(getFcmTopicForPackage('com.mizo.news'), 'app_update_com.mizo.news');
  assert.equal(getFcmTopicForPackage('com.mizo@app#test'), 'app_update_com.mizo_app_test');
});

test('createFcmUpdatePayload builds valid FCM payload with Mizo texts', () => {
  const dummyApp: AppItem = {
    id: 'app_1',
    name: 'Mizo Chanchinbu',
    packageName: 'com.mizo.news',
    category: 'chanchinbu',
    shortDesc: 'Thuthang lakkhawmna',
    fullDesc: 'Mizoram chanchinbu hrang hrang chhiarna app.',
    iconUrl: '/icon.png',
    screenshots: [],
    versionName: '1.0.0',
    versionCode: 1,
    minSdkVersion: 24,
    apkSize: 10485760,
    apkFileName: 'mizo_news.apk',
    apkDownloadUrl: 'https://example.com/app.apk',
    downloadsCount: 500,
    rating: 4.6,
    ratingCount: 80,
    developer: {
      id: 'dev_1',
      name: 'Lalrinchhana',
      email: 'rinchhana@example.com',
      verified: true,
    },
    updatedAt: '2026-01-01',
    createdAt: '2026-01-01',
    changelog: 'Chhuah tan a ni.',
    versionHistory: [],
  };

  const payload = createFcmUpdatePayload(dummyApp, {
    versionName: '1.1.0',
    versionCode: 2,
    changelog: 'Dark mode telh a ni.',
    isCritical: false,
  });

  assert.equal(payload.topic, '/topics/app_update_com.mizo.news');
  assert.match(payload.notification.title, /Update thar a awm e/);
  assert.match(payload.notification.body, /Dark mode telh a ni/);
  assert.equal(payload.data.versionName, '1.1.0');
  assert.equal(payload.data.versionCode, '2');
  assert.equal(payload.data.isCritical, 'false');
});

test('filterApps filters by query and category correctly', () => {
  const apps: AppItem[] = [
    {
      id: '1',
      name: 'Mizo Bible',
      packageName: 'com.mizo.bible',
      category: 'bible_hla',
      shortDesc: 'Pathian lehkha bu',
      fullDesc: '',
      iconUrl: '',
      screenshots: [],
      versionName: '1.0.0',
      versionCode: 1,
      minSdkVersion: 24,
      apkSize: 1000,
      apkFileName: 'app.apk',
      apkDownloadUrl: '',
      downloadsCount: 10000,
      rating: 4.9,
      ratingCount: 500,
      developer: { id: 'd1', name: 'Zonet Dev', email: '', verified: true },
      updatedAt: '2026-02-01',
      createdAt: '2026-01-01',
      changelog: '',
      versionHistory: [],
    },
    {
      id: '2',
      name: 'Cheraw Jump',
      packageName: 'com.mizo.game.cheraw',
      category: 'game',
      shortDesc: 'Mizo bamboo dance game',
      fullDesc: '',
      iconUrl: '',
      screenshots: [],
      versionName: '1.0.0',
      versionCode: 1,
      minSdkVersion: 26,
      apkSize: 2000,
      apkFileName: 'game.apk',
      apkDownloadUrl: '',
      downloadsCount: 5000,
      rating: 4.7,
      ratingCount: 300,
      developer: { id: 'd2', name: 'Aizawl Games', email: '', verified: true },
      updatedAt: '2026-03-01',
      createdAt: '2026-01-01',
      changelog: '',
      versionHistory: [],
    },
  ];

  // Test query
  const queryResult = filterApps(apps, 'cheraw', 'all');
  assert.equal(queryResult.length, 1);
  assert.equal(queryResult[0].name, 'Cheraw Jump');

  // Test category
  const catResult = filterApps(apps, '', 'bible_hla');
  assert.equal(catResult.length, 1);
  assert.equal(catResult[0].name, 'Mizo Bible');

  // Test sort latest
  const sortedLatest = filterApps(apps, '', 'all', 'latest');
  assert.equal(sortedLatest[0].name, 'Cheraw Jump');
});
