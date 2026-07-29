import axios from "axios";
import { url as baseUrl, token } from "../../api";

export const getHivstPatients = (search = "*", page = 0, size = 20) => {
  return axios.get(`${baseUrl}hivst-encounter/patients`, {
    params: { search, page, size },
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const getHivstEncountersForPatient = (patientId) => {
  return axios.get(`${baseUrl}hivst-encounter/patient/${patientId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const getHivstEncounter = (id) => {
  return axios.get(`${baseUrl}hivst-encounter/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const createHivstEncounter = (payload) => {
  return axios.post(`${baseUrl}hivst-encounter`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const updateHivstEncounter = (id, payload) => {
  return axios.put(`${baseUrl}hivst-encounter/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const archiveHivstEncounter = (id) => {
  return axios.delete(`${baseUrl}hivst-encounter/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getHivstResultByEncounter = (encounterId) => {
  return axios.get(`${baseUrl}hivst-result/encounter/${encounterId}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const createHivstResult = (payload) => {
  return axios.post(`${baseUrl}hivst-result`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const updateHivstResult = (id, payload) => {
  return axios.put(`${baseUrl}hivst-result/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);
};

export const archiveHivstResult = (id) => {
  return axios.delete(`${baseUrl}hivst-result/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};