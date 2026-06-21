import { getProfile, saveProfile } from './utils/storage.js';

let _profileName = null;
let _data = null;

export function loadProfile(name) {
  _profileName = name;
  _data = getProfile(name);
}

export function getState() {
  return _data;
}

export function save() {
  if (_profileName && _data) {
    saveProfile(_profileName, _data);
  }
}

export function getProfileName() {
  return _profileName;
}
