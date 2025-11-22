import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  // ---------------- LOGIN HOOKS ----------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.error) {
      setError("Invalid email or password");
    }
  };

  // ---------------- ADMIN PANEL HOOKS ----------------
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [wishes, setWishes] = useState([]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [wishToDelete, setWishToDelete] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [wishToMarkUntaken, setWishToMarkUntaken] = useState(null);

  // ---------------- EDIT MODAL HOOKS ----------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [wishToEdit, setWishToEdit] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQuantity, setEditQuantity] = useState(0);
  const [editCategory, setEditCategory] = useState("");
  const [editTaken, setEditTaken] = useState(false);
  const [editTakenBy, setEditTakenBy] = useState("");

  // ---------------- CATEGORY EDIT/DELETE ----------------
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState("");

  // ---------------- LOAD WISHES ----------------
  const loadWishes = async () => {
    if (!session) return;
    const res = await fetch("/api/wishes");
    const data = await res.json();
    setWishes(data.wishes);
    setCategories(data.categories.sort());
  };

  useEffect(() => {
    if (session) loadWishes();
  }, [session]);

  // ---------------- FUNCTIONS ----------------
  const addWish = async () => {
    if (!title || (!category && !newCategory)) return alert("Title and Category required");

    const categoryToSend = newCategory || category;

    await fetch("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category: categoryToSend }),
    });

    setTitle("");
    setDescription("");
    setCategory("");
    setNewCategory("");
    loadWishes();
  };

  const handleMarkTaken = async (wish) => {
    const takenBy = prompt("Enter name of person taking the wish:");
    const quantity = prompt("Enter quantity:", "1");

    await fetch("/api/wishes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: wish._id,
        taken: true,
        takenBy,
        quantity: Number(quantity),
      }),
    });

    loadWishes();
  };

  const handleMarkUntakenClick = (wish) => {
    setWishToMarkUntaken(wish);
    setConfirmModalOpen(true);
  };

  const confirmMarkUntaken = async () => {
    await fetch("/api/wishes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: wishToMarkUntaken._id,
        taken: false,
        takenBy: "",
        quantity: 0,
      }),
    });

    setConfirmModalOpen(false);
    setWishToMarkUntaken(null);
    loadWishes();
  };

  const openDeleteModal = (wish) => {
    setWishToDelete(wish);
    setDeleteModalOpen(true);
  };

  const deleteWish = async () => {
    await fetch("/api/wishes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: wishToDelete._id }),
    });

    setDeleteModalOpen(false);
    setWishToDelete(null);
    loadWishes();
  };

  const openEditModal = (wish) => {
    setWishToEdit(wish);
    setEditTitle(wish.title);
    setEditDescription(wish.description);
    setEditQuantity(wish.quantity || 0);
    setEditCategory(wish.category || "");
    setEditTaken(wish.taken);
    setEditTakenBy(wish.takenBy || "");
    setEditModalOpen(true);
  };

  const saveEdit = async () => {
    await fetch("/api/wishes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: wishToEdit._id,
        title: editTitle,
        description: editDescription,
        quantity: Number(editQuantity),
        category: editCategory,
        taken: editTaken,
        takenBy: editTaken ? editTakenBy : "",
      }),
    });

    setEditModalOpen(false);
    setWishToEdit(null);
    loadWishes();
  };

  const groupWishesByCategory = () => {
    const grouped = {};

    wishes.forEach((wish) => {
      const cat = wish.category || "Uncategorized";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(wish);
    });

    return Object.keys(grouped)
      .sort()
      .map((cat) => ({ category: cat, wishes: grouped[cat] }));
  };

  if (loading) return <p>Loading...</p>;

  if (!session) {
    return (
      <div
        style={{
          maxWidth: 350,
          margin: "100px auto",
          padding: 20,
          textAlign: "center",
          fontFamily: "Arial",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Admin Login</h2>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "80%", padding: 10, margin: "10px 0", borderRadius: 5, border: "1px solid #ccc" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "80%", padding: 10, margin: "10px 0", borderRadius: 5, border: "1px solid #ccc" }}
        />

        {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

        <button
          style={{ padding: "10px 15px", width: "50%", background: "#0070f3", color: "white", border: "none", borderRadius: 5, cursor: "pointer", marginTop: 10 }}
          onClick={handleLogin}
        >
          Sign in
        </button>
      </div>
    );
  }

  // ---------------- ADMIN PANEL UI ----------------
  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
        padding: 20,
        background: "#f3c1c1ff",
        borderRadius: 10,
        boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      }}
    >
      <button
        style={{ marginBottom: 20, padding: "5px 10px" }}
        onClick={() => signOut()}
      >
        Logout
      </button>

      <h1 style={{ textAlign: "center" }}>Admin Panel</h1>

      {/* --- ADD WISH --- */}
      <h2>Add Wish</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={{
          width: "97%",
          padding: 10,
          margin: "10px 0",
          borderRadius: 5,
          border: "1px solid #ccc",
        }}
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        style={{
          width: "97%",
          padding: 10,
          margin: "10px 0",
          borderRadius: 5,
          border: "1px solid #ccc",
        }}
      />

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "20px" }}>
          Choose or Create Category
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={newCategory.length > 0}
            style={{
              padding: 8,
              marginBottom: 20,
              borderRadius: 5,
              border: "1px solid #ccc",
            }}
          >
            <option value="">Select a Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {category && (
            <>
              <button
                style={{
                  padding: "5px 10px",
                  background: "#f7dd49",
                  borderRadius: 5,
                }}
                onClick={() => {
                  setCategoryToEdit(category);
                  setNewCategoryName(category);
                  setEditCategoryModalOpen(true);
                }}
              >
                Edit
              </button>

              <button
                style={{
                  padding: "5px 10px",
                  background: "#f74949",
                  color: "#fff",
                  borderRadius: 5,
                }}
                onClick={() => {
                  setCategoryToDelete(category);
                  setDeleteCategoryModalOpen(true);
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>

        <input
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{
            width: "97%",
            padding: 10,
            margin: "10px 0",
            borderRadius: 5,
            border: "1px solid #ccc",
          }}
        />
      </div>

      <button
        onClick={addWish}
        style={{
          padding: "10px 15px",
          background: "#43b14cff",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        Add Wish
      </button>

      {/* --- EXISTING WISHES --- */}
      <h2>Existing Wishes</h2>

      {groupWishesByCategory().map(({ category, wishes }) => (
        <div key={category}>
          <h3 style={{ color: "#0070f3" }}>{category}</h3>

          {wishes.map((wish) => (
            <div
              key={wish._id}
              style={{
                margin: "10px 0",
                padding: 15,
                borderRadius: 8,
                background: wish.taken ? "#ffe6e6" : "#fff",
                borderLeft: wish.taken
                  ? "5px solid red"
                  : "5px solid #0070f3",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{wish.title}</strong>
                <br />
                <small>{wish.description}</small>
                <br />
                {wish.takenBy && <em>Taken by: {wish.takenBy}</em>}
                <br />
                {wish.quantity && <em>Quantity: {wish.quantity}</em>}
              </div>

              <div>
                <button
                  style={{
                    padding: "5px 10px",
                    marginRight: 5,
                    background: "#f7dd49ff",
                    borderRadius: 5,
                  }}
                  onClick={() => openEditModal(wish)}
                >
                  Edit
                </button>

                <button
                  style={{
                    padding: "5px 10px",
                    background: "#f74949ff",
                    color: "#fff",
                    borderRadius: 5,
                  }}
                  onClick={() => openDeleteModal(wish)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* --- DELETE WISH MODAL --- */}
      {deleteModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              minWidth: 300,
              textAlign: "center",
            }}
          >
            <p>
              Delete <strong>{wishToDelete.title}</strong>?
            </p>
            <button
              style={{
                margin: 10,
                padding: "10px 15px",
                background: "#43b14cff",
                color: "white",
                border: "none",
                borderRadius: 5,
              }}
              onClick={deleteWish}
            >
              Yes
            </button>
            <button
              style={{
                margin: 10,
                padding: "10px 15px",
                background: "#f57474ff",
                color: "white",
                border: "none",
                borderRadius: 5,
              }}
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- UNTAKEN MODAL --- */}
      {confirmModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              minWidth: 300,
              textAlign: "center",
            }}
          >
            <p>
              Mark <strong>{wishToMarkUntaken.title}</strong> as untaken?
            </p>

            <button
              style={{
                margin: 10,
                padding: "10px 15px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: 5,
              }}
              onClick={confirmMarkUntaken}
            >
              Yes
            </button>

            <button
              style={{
                margin: 10,
                padding: "10px 15px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: 5,
              }}
              onClick={() => setConfirmModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* --- EDIT WISH MODAL --- */}
      {editModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 10,
              width: "400px",
              maxWidth: "90%",
              boxSizing: "border-box",
              textAlign: "left",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>
              Edit Wish
            </h2>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 5,
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 5,
                  border: "1px solid #ccc",
                  minHeight: 60,
                }}
              />
            </div>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Quantity
              </label>

              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  style={{
                    textAlign: "center",
                    padding: 8,
                    borderRadius: 5,
                    border: "1px solid #ccc",
                  }}
                />

                <button
                  onClick={() =>
                    setEditQuantity((prev) =>
                      Math.max(0, Number(prev) - 1)
                    )
                  }
                  style={{
                    padding: "6px 10px",
                    marginLeft: 10,
                    background: "#ccc",
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                >
                  ➖
                </button>

                <button
                  onClick={() =>
                    setEditQuantity((prev) => Number(prev) + 1)
                  }
                  style={{
                    padding: "6px 10px",
                    marginLeft: 5,
                    background: "#ccc",
                    border: "none",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                >
                  ➕
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Category
              </label>

              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  borderRadius: 5,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                <input
                  type="checkbox"
                  checked={editTaken}
                  onChange={(e) => setEditTaken(e.target.checked)}
                  style={{ marginRight: 5 }}
                />
                Taken
              </label>

              {editTaken && (
                <div style={{ marginTop: 10 }}>
                  <label
                    style={{
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    Taken By
                  </label>
                  <input
                    type="text"
                    value={editTakenBy}
                    onChange={(e) =>
                      setEditTakenBy(e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: 8,
                      borderRadius: 5,
                      border: "1px solid #ccc",
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <button
                style={{
                  padding: "10px 20px",
                  marginRight: 10,
                  background: "#43b14cff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
                onClick={saveEdit}
              >
                Save
              </button>

              <button
                style={{
                  padding: "10px 20px",
                  background: "#f19999ff",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT CATEGORY MODAL --- */}
      {editCategoryModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: 300,
              textAlign: "center",
            }}
          >
            <h3>Edit Category</h3>

            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 5,
                border: "1px solid #ccc",
                marginTop: 10,
              }}
            />

            <div style={{ marginTop: 15 }}>
              <button
                style={{
                  padding: "8px 15px",
                  background: "#43b14c",
                  color: "#fff",
                  borderRadius: 5,
                }}
                onClick={async () => {
                  await fetch("/api/wishes", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      mode: "rename-category",
                      oldCategory: categoryToEdit,
                      newCategory: newCategoryName,
                    }),
                  });

                  setEditCategoryModalOpen(false);
                  loadWishes();
                }}
              >
                Save
              </button>

              <button
                style={{
                  padding: "8px 15px",
                  marginLeft: 10,
                  background: "#ccc",
                  borderRadius: 5,
                }}
                onClick={() => setEditCategoryModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CATEGORY MODAL --- */}
      {deleteCategoryModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: 300,
              textAlign: "center",
            }}
          >
            <p>
              Delete category <strong>{categoryToDelete}</strong>?
            </p>

            <p style={{ fontSize: 12, color: "red" }}>
              All wishes in this category will be removed.
            </p>

            <button
              style={{
                padding: "8px 15px",
                background: "#f74949",
                color: "#fff",
                borderRadius: 5,
              }}
              onClick={async () => {
                await fetch("/api/wishes", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    mode: "delete-category",
                    oldCategory: categoryToDelete,
                  }),
                });

                setDeleteCategoryModalOpen(false);
                loadWishes();
              }}
            >
              Delete
            </button>

            <button
              style={{
                padding: "8px 15px",
                marginLeft: 10,
                background: "#ccc",
                borderRadius: 5,
              }}
              onClick={() => setDeleteCategoryModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
