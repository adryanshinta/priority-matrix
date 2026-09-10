markdown_content = """# Product Requirement Document (PRD): Todo List Berbasis Kuadran Prioritas

## 1. Ikhtisar Produk & Tujuan (Overview & Goals)

- **Nama Produk:** PriorityMatrix Todo App
- **Deskripsi Singkat:** Aplikasi web manajemen tugas (_todo list_) berbasis matriks prioritas (Eisenhower Matrix) yang membantu pengguna memilah tugas berdasarkan tingkat urgensi dan kepentingannya.
- **Tujuan Utama:**
  - Meningkatkan produktivitas pengguna dengan fokus pada tugas yang benar-benar berdampak.
  - Meminimalisir distraksi dari tugas-tugas yang tidak penting atau tidak mendesak.
- **Tech Stack:**
  - **Frontend:** React (Vite / Create React App)
  - **Styling:** Tailwind CSS
  - **Penyimpanan Saat Ini:** _Local State_ (React `useState` / `localStorage`) dengan persiapan arsitektur siap integrasi API/Database.

---

## 2. Fitur Utama (Core Features)

1. **Manajemen Tugas (CRUD):** Tambah, lihat, ubah status (selesai/belum), dan hapus tugas.
2. **Eisenhower Priority Matrix (4 Kuadran):**
   - **Kuadran 1:** Urgent & Important (Lakukan Sekarang / _Do First_)
   - **Kuadran 2:** Not Urgent & Important (Jadwalkan / _Schedule_)
   - **Kuadran 3:** Urgent & Not Important (Delegasikan / _Delegate_)
   - **Kuadran 4:** Not Urgent & Not Important (Hilangkan / _Eliminate_ / _Don't Do_)
3. **Penyaringan & Tampilan:** Melihat tugas berdasarkan kuadran atau tampilan daftar universal.
4. **Indikator Produktivitas:** Menampilkan ringkasan tugas yang selesai vs. belum selesai.

---

## 3. Instruksi Khusus untuk AI Coding Agent

> **Catatan untuk AI Agent:**
>
> 1. Gunakan fungsionalitas komponen modern React (Functional Components & Hooks).
> 2. Berikan **komentar di setiap baris kode** (line-by-line comments) untuk menjelaskan alur logikanya.
> 3. **Highlight dengan jelas** (`// TODO: API_INTEGRATION_POINT`) pada baris-baris kode yang nantinya akan menghubungkan _backend API_ atau _database_.

---

## 4. Struktur Kode & Implementasi (Template untuk AI)

```jsx
// ==========================================
// IMPORT MODULES & DEPENDENCIES
// ==========================================
import React, { useState, useEffect } from "react"; // Mengimpor React dan hooks dasar

// ==========================================
// MAIN COMPONENT: PriorityTodoList
// ==========================================
export default function PriorityTodoList() {
  // State untuk menyimpan daftar seluruh tugas
  // // TODO: API_INTEGRATION_POINT - Ganti initial state ini dengan pemanggilan API GET (fetch/axios) saat mengambil data dari database
  const [tasks, setTasks] = useState([
    { id: 1, title: "Contoh Tugas Penting", quadrant: "q1", completed: false },
  ]);

  // State untuk form input tugas baru
  const [inputTitle, setInputTitle] = useState("");
  const [inputQuadrant, setInputQuadrant] = useState("q1"); // Default ke Kuadran 1

  // ==========================================
  // LOCAL STORAGE / API SYNC EFFECT
  // ==========================================
  useEffect(() => {
    // // TODO: API_INTEGRATION_POINT - Tempat memuat data awal (GET /api/tasks) dari server/database eksternal saat komponen pertama kali dirender
    const savedTasks = localStorage.getItem("priority_tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  useEffect(() => {
    // // TODO: API_INTEGRATION_POINT - Tempat melakukan sinkronisasi otomatis atau penyimpanan lokal (Opsional jika langsung pakai database)
    localStorage.setItem("priority_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // ==========================================
  // HANDLE FUNCTIONS (LOGIC)
  // ==========================================

  // Fungsi untuk menambah tugas baru
  const handleAddTask = (e) => {
    e.preventDefault(); // Mencegah reload halaman default form
    if (!inputTitle.trim()) return; // Validasi agar tidak kosong

    const newTask = {
      id: Date.now(), // Sementara menggunakan timestamp sebagai ID unik
      title: inputTitle,
      quadrant: inputQuadrant,
      completed: false,
    };

    // // TODO: API_INTEGRATION_POINT - Lakukan POST request ke database (misal: axios.post('/api/tasks', newTask)) untuk menyimpan data secara permanen
    setTasks([...tasks, newTask]); // Memperbarui state lokal dengan tugas baru
    setInputTitle(""); // Mereset input form
  };

  // Fungsi untuk mengubah status selesai/belum tugas
  const handleToggleComplete = (id) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, completed: !task.completed };

          // // TODO: API_INTEGRATION_POINT - Lakukan PUT/PATCH request ke database (misal: axios.patch(`/api/tasks/${id}`, { completed: updatedTask.completed }))
          return updatedTask;
        }
        return task;
      }),
    );
  };

  // Fungsi untuk menghapus tugas
  const handleDeleteTask = (id) => {
    // // TODO: API_INTEGRATION_POINT - Lakukan DELETE request ke database (misal: axios.delete(`/api/tasks/${id}`)) sebelum menghapusnya dari state lokal
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // ==========================================
  // RENDER UI (TAILWIND CSS)
  // ==========================================
  return (
    // Container utama dengan background abu-abu cerah dan font interaktif
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header Aplikasi */}
      <header className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800">
          Priority Matrix Todo
        </h1>
        <p className="text-slate-600 mt-1">
          Fokus pada prioritas, kurangi distraksi, tingkatkan produktivitas.
        </p>
      </header>

      {/* Form Input Tugas */}
      <section className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md mb-10">
        <form onSubmit={handleAddTask} className="flex flex-col gap-4">
          {/* Input Judul Tugas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nama Tugas
            </label>
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="Contoh: Menyelesaikan laporan bulanan..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pilihan Kuadran Prioritas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pilih Kuadran Prioritas
            </label>
            <select
              value={inputQuadrant}
              onChange={(e) => setInputQuadrant(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="q1">
                Kuadran 1: Urgent & Important (Lakukan Sekarang)
              </option>
              <option value="q2">
                Kuadran 2: Not Urgent & Important (Jadwalkan)
              </option>
              <option value="q3">
                Kuadran 3: Urgent & Not Important (Delegasikan)
              </option>
              <option value="q4">
                Kuadran 4: Not Urgent & Not Important (Hilangkan)
              </option>
            </select>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Tambah Tugas
          </button>
        </form>
      </section>

      {/* Grid Matriks Eisenhower (4 Kuadran) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* KUADRAN 1: Do First */}
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-sm">
          <h2 className="font-bold text-red-700 text-lg mb-2">
            🔥 Q1: Do First (Mendesak & Penting)
          </h2>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.quadrant === "q1")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              ))}
          </div>
        </div>

        {/* KUADRAN 2: Schedule */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg shadow-sm">
          <h2 className="font-bold text-blue-700 text-lg mb-2">
            📅 Q2: Schedule (Tidak Mendesak & Penting)
          </h2>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.quadrant === "q2")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              ))}
          </div>
        </div>

        {/* KUADRAN 3: Delegate */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded-lg shadow-sm">
          <h2 className="font-bold text-yellow-700 text-lg mb-2">
            👥 Q3: Delegate (Mendesak & Tidak Penting)
          </h2>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.quadrant === "q3")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              ))}
          </div>
        </div>

        {/* KUADRAN 4: Eliminate */}
        <div className="bg-slate-100 border-l-4 border-slate-400 p-5 rounded-lg shadow-sm">
          <h2 className="font-bold text-slate-700 text-lg mb-2">
            🗑️ Q4: Eliminate (Tidak Mendesak & Tidak Penting)
          </h2>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.quadrant === "q4")
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: TaskCard
// ==========================================
function TaskCard({ task, onToggle, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-md shadow-xs border border-slate-200">
      <div className="flex items-center gap-3">
        {/* Checkbox status tugas */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
        />
        {/* Judul tugas dengan efek garis coret jika selesai */}
        <span
          className={`text-slate-800 ${task.completed ? "line-through text-slate-400" : ""}`}
        >
          {task.title}
        </span>
      </div>
      {/* Tombol Hapus Tugas */}
      <button
        onClick={() => onDelete(task.id)}
        className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded"
      >
        Hapus
      </button>
    </div>
  );
}
```
