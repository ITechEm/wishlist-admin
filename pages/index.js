import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
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
      setError("Email sau Parolă incorectă! Raport trimis!");
    }
  };

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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [wishToEdit, setWishToEdit] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQuantity, setEditQuantity] = useState(0);
  const [editCategory, setEditCategory] = useState("");
  const [editTaken, setEditTaken] = useState(false);
  const [editTakenBy, setEditTakenBy] = useState("");

  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");

  const [deleteCategoryModalOpen, setDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState("");

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
          fontFamily: "Inknut Antiqua, serif",
          background: "linear-gradient(135deg, #f7a1a1, #ffd6d6, #925151)",
          borderRadius: 10,
          boxShadow: "0 0 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Admin Panel Listă Dorințe</h2>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "80%", padding: 10, margin: "10px 0", borderRadius: 5, border: "1px solid #ccc", fontFamily: "Inknut Antiqua, serif"}}
        />

        <input
        
          type="password"
          placeholder="Parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "80%", padding: 10, margin: "10px 0", borderRadius: 5, border: "1px solid #ccc",fontFamily: "Inknut Antiqua, serif"}}
        />

        {error && <p style={{ color: "red", marginBottom: 10 }}>{error}</p>}

        <button 
          style={{  width: "50%", background: "linear-gradient(135deg, #518b92ff, #f7a1a1, #6fa8dc)", border: "none", borderRadius: 5, cursor: "pointer", marginTop: 10,fontFamily: "Inknut Antiqua, serif", color: "#000000ff", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", transition: "all 0.3s ease", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",}}
          onClick={handleLogin}
          onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
        >
          <h3>Conectează-te</h3>
        </button>
      </div>
    );
  }
  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
        padding: 20,
        background: "linear-gradient(135deg, #f7a1a1, #ffd6d6, #925151)",
        borderRadius: 10,
        boxShadow: "0 0 20px rgba(0,0,0,0.1)",
      }}
    >
      <button
        onClick={() => signOut()}
        style={{
          marginBottom: 20,
          padding: "10px 20px",
          background: "linear-gradient(135deg, #ff6b6b, #f06595)",
          color: "#000000ff",
          fontWeight: "bold",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
      >
        Logout
      </button>
      <h1 style={{ textAlign: "center",fontFamily: "Inknut Antiqua, serif", }}>Admin Panel</h1>

      <h2 style={{fontFamily: "Inknut Antiqua, serif", }}>Adaugă dorință</h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titlu"
        style={{
          fontFamily: "Inknut Antiqua, serif",
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
        placeholder="Descriere"
        style={{
          fontFamily: "Inknut Antiqua, serif",
          width: "97%",
          padding: 10,
          margin: "10px 0",
          borderRadius: 5,
          border: "1px solid #ccc",
        }}
      />

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "20px", marginBottom: "10px", display: "block",fontFamily: "Inknut Antiqua, serif" }}>
          Alege sau creează o Categorie
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={newCategory.length > 0}
            style={{
              fontFamily: "Inknut Antiqua, serif",
              padding: 8,
              marginBottom: 20,
              borderRadius: 5,
              border: "1px solid #ccc",
            }}
          >
            <option style={{fontFamily: "Inknut Antiqua, serif"}} value="">Selectează o categorie</option>
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
                  fontFamily: "Inknut Antiqua, serif",
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
                Editează
              </button>

              <button
                style={{
                  fontFamily: "Inknut Antiqua, serif",
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
                Șterge
              </button>
            </>
          )}
        </div>

        <input
          type="text"
          placeholder="Creează o categorie nouă"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{
            fontFamily: "Inknut Antiqua, serif",
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
          marginBottom: 20,
          padding: "10px 20px",
          background: "linear-gradient(135deg, #a1ff6bff, #f0db65ff)",
          color: "#000000ff",
          fontWeight: "bold",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
        }}
      >
        Adaugă Dorință
      </button>

      <h2 style={{fontFamily: "Inknut Antiqua, serif"}}>Dorințe Existente</h2>

      {groupWishesByCategory().map(({ category, wishes }) => (
        <div key={category}>
          <h3 style={{ color: "#000000ff" }}>{category}</h3>

          {wishes.map((wish) => (
            <div
              key={wish._id}
              style={{
                fontFamily: "Inknut Antiqua, serif",
                margin: "10px 0",
                padding: 15,
                borderRadius: 8,
                background: wish.taken ? "linear-gradient(135deg, #ffe6e6, #cec4c446, #ac828231)" : "linear-gradient(135deg, #f5c2c281, #fff, #f8dddd80)",
                borderLeft: wish.taken
                  ? "5px solid red"
                  : "5px solid #69ca49ff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{fontFamily: "Inknut Antiqua, serif", flexDirection: "column", flex: "1 1 auto", marginRight: 20 }}>
                <strong>{wish.title}</strong>
                <br />
                <small style={{flex: "1 1 auto", wordBreak: "break-word"}}>{wish.description}</small>
                <br />
                {wish.takenBy && <em>Preluat de: {wish.takenBy}</em>}
                <br />
                {wish.quantity && <em>Cantitate: {wish.quantity}</em>}
              </div>

              <div >
                <button
                  style={{
                    fontFamily: "Inknut Antiqua, serif",
                    padding: "5px 10px",
                    marginRight: 5,
                    background: "#f7dd49ff",
                    borderRadius: 5,
                    flexDirection: "column", flex: "1 1 auto",
                  }}
                  onClick={() => openEditModal(wish)}
                >
                  Editează
                </button>

                <button
                  style={{
                    fontFamily: "Inknut Antiqua, serif",
                    padding: "5px 10px",
                    background: "#f74949ff",
                    color: "#fff",
                    borderRadius: 5,
                    
                  }}
                  onClick={() => openDeleteModal(wish)}
                >
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

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
              Ștergi dorința <strong>{wishToDelete.title}</strong>?
            </p>
            <button
              style={{
                fontFamily: "Inknut Antiqua, serif",
                margin: 10,
                padding: "10px 15px",
                background: "#43b14cff",
                color: "white",
                border: "none",
                borderRadius: 5,
              }}
              onClick={deleteWish}
            >
              Da
            </button>
            <button
              style={{
                fontFamily: "Inknut Antiqua, serif",
                margin: 10,
                padding: "10px 15px",
                background: "#f57474ff",
                color: "white",
                border: "none",
                borderRadius: 5,
              }}
              onClick={() => setDeleteModalOpen(false)}
            >
              Anulează
            </button>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div
          style={{
            fontFamily: "Inknut Antiqua, serif",
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
              fontFamily: "Inknut Antiqua, serif",
              background: "#fff",
              padding: 30,
              borderRadius: 10,
              width: "400px",
              maxWidth: "90%",
              boxSizing: "border-box",
              textAlign: "left",
            }}
          >
            <h2 style={{ textAlign: "center", marginBottom: 20,fontFamily: "Inknut Antiqua, serif"}}>
              Editează Dorința
            </h2>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  fontFamily: "Inknut Antiqua, serif",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Titlul
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{
                  fontFamily: "Inknut Antiqua, serif",
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
                  fontFamily: "Inknut Antiqua, serif",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Descrierea
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                style={{
                  fontFamily: "Inknut Antiqua, serif",
                  width: "100%",
                  padding: 8,
                  borderRadius: 5,
                  border: "1px solid #ccc",
                  minHeight: 60,
                }}
              />
            </div>

            <div style={{ marginBottom: 15, fontFamily: "Inknut Antiqua, serif" }}>
              <label
                style={{
                  fontFamily: "Inknut Antiqua, serif",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Cantitatea
              </label>

              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  style={{
                    fontFamily: "Inknut Antiqua, serif",
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
                    fontFamily: "Inknut Antiqua, serif",
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
                    fontFamily: "Inknut Antiqua, serif",
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
                  fontFamily: "Inknut Antiqua, serif",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                Categoria
              </label>

              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                style={{
                  fontFamily: "Inknut Antiqua, serif",
                  width: "100%",
                  padding: 8,
                  borderRadius: 5,
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Selectează Categoria</option>
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
                  fontFamily: "Inknut Antiqua, serif",
                  fontWeight: "bold",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                <input
                  type="checkbox"
                  checked={editTaken}
                  onChange={(e) => setEditTaken(e.target.checked)}
                  style={{ marginRight: 5, fontFamily: "Inknut Antiqua, serif" }}
                />
                Preluare
              </label>

              {editTaken && (
                <div style={{ marginTop: 10 }}>
                  <label
                    style={{
                      fontFamily: "Inknut Antiqua, serif",
                      fontWeight: "bold",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    De către
                  </label>
                  <input
                    type="text"
                    value={editTakenBy}
                    onChange={(e) =>
                      setEditTakenBy(e.target.value)
                    }
                    style={{
                      fontFamily: "Inknut Antiqua, serif",
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
                  fontFamily: "Inknut Antiqua, serif",
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
                Salvează
              </button>

              <button
                style={{
                  fontFamily: "Inknut Antiqua, serif",
                  padding: "10px 20px",
                  background: "#f19999ff",
                  border: "none",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
                onClick={() => setEditModalOpen(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {editCategoryModalOpen && (
        <div
          style={{
            fontFamily: "Inknut Antiqua, serif",
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
              fontFamily: "Inknut Antiqua, serif",
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: 300,
              textAlign: "center",
            }}
          >
            <h3>Editează Categoria</h3>

            <input
            placeholder="Nume nou categorie"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{
                fontFamily: "Inknut Antiqua, serif",
                width: "90%",
                padding: 8,
                borderRadius: 5,
                border: "1px solid #ccc",
                marginTop: 10,
              }}
            />

            <div style={{ marginTop: 15 }}>
              <button
                style={{
                  fontFamily: "Inknut Antiqua, serif",
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
                Salvează
              </button>

              <button
                style={{
                  fontFamily: "Inknut Antiqua, serif",
                  padding: "8px 15px",
                  marginLeft: 10,
                  background: "#f19999ff",
                  borderRadius: 5,
                }}
                onClick={() => setEditCategoryModalOpen(false)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteCategoryModalOpen && (
        <div
          style={{
            fontFamily: "Inknut Antiqua, serif",
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
              fontFamily: "Inknut Antiqua, serif",
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: 300,
              textAlign: "center",
            }}
          >
            <p>
              Ștergi categoria <strong>{categoryToDelete}</strong>?
            </p>

            <p style={{ fontSize: 12, color: "red" }}>
              Toate dorințele din această categorie vor fi necategorizate.
            </p>

            <button
              style={{
                fontFamily: "Inknut Antiqua, serif",
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
              Șterge
            </button>

            <button
              style={{
                fontFamily: "Inknut Antiqua, serif",
                padding: "8px 15px",
                marginLeft: 10,
                background: "#43b14c",
                color: "#fff",
                borderRadius: 5,
              }}
              onClick={() => setDeleteCategoryModalOpen(false)}
            >
              Anulează
            </button>
          </div>
        </div>
      )}
    </div>
  );
}