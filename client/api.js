import axios from "axios";
import { encodeNotePath } from "./helpers.js";

const http = axios.create({ baseURL: "/" });

export async function getTree() {
  const { data } = await http.get("/api/tree");
  return data;
}

export async function getNote(path) {
  const { data } = await http.get(`/api/notes/${encodeNotePath(path)}`);
  return data;
}

export async function saveNote(path, content) {
  const { data } = await http.put(`/api/notes/${encodeNotePath(path)}`, { content });
  return data;
}

export async function createNote(path, content = "") {
  const { data } = await http.post(`/api/notes/${encodeNotePath(path)}`, { content });
  return data;
}

export async function deleteNote(path) {
  await http.delete(`/api/notes/${encodeNotePath(path)}`);
}

export async function moveNote(path, newPath) {
  const { data } = await http.patch(`/api/notes/${encodeNotePath(path)}`, { new_path: newPath });
  return data;
}

export async function moveFolder(path, newPath) {
  const { data } = await http.patch(`/api/folders/${encodeNotePath(path)}`, { new_path: newPath });
  return data;
}

export async function renameFolder(path, newName) {
  const parent = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  const newPath = parent ? `${parent}/${newName}` : newName;
  const { data } = await http.patch(`/api/folders/${encodeNotePath(path)}`, { new_path: newPath });
  return data;
}

export async function deleteFolder(path) {
  await http.delete(`/api/folders/${encodeNotePath(path)}`);
}

export async function createFolder(path) {
  const { data } = await http.post(`/api/folders/${encodeNotePath(path)}`);
  return data;
}

export async function search(q, limit = 20) {
  const { data } = await http.get("/api/search", { params: { q, limit } });
  return data;
}
