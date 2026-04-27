/**
 * components/admin/HeroSliderManager.jsx
 * Admin CRUD manager for heroSlides Firestore collection.
 */

import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave } from "react-icons/fi";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import GoldSpinner from "../common/GoldSpinner";

const S = {
  wrap: {
    fontFamily: "'Tajawal', sans-serif",
    maxWidth: "980px",
  },
  title: {
    fontSize: "1.3rem",
    fontWeight: 800,
    color: "#FFFFFF",
    margin: "0 0 1.25rem",
  },
  card: {
    backgroundColor: "#455A64",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "16px",
    padding: "1rem",
    marginBottom: "1rem",
  },
  listRow: {
    display: "grid",
    gridTemplateColumns: "1fr 85px 100px 170px",
    gap: "0.85rem",
    alignItems: "center",
    padding: "0.8rem",
    border: "1px solid rgba(212,175,55,0.15)",
    borderRadius: "12px",
    backgroundColor: "rgba(38,50,56,0.45)",
    marginBottom: "0.75rem",
  },
  preview: {
    minHeight: "84px",
    borderRadius: "10px",
    padding: "0.8rem",
    border: "1px solid rgba(212,175,55,0.22)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  previewTitle: { margin: 0, fontSize: "0.95rem", fontWeight: 800 },
  previewSub: { margin: 0, fontSize: "0.8rem", opacity: 0.85 },
  previewBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: "0.5rem",
    padding: "0.24rem 0.7rem",
    borderRadius: "999px",
    fontSize: "0.76rem",
    fontWeight: 700,
    border: "1px solid rgba(212,175,55,0.45)",
    backgroundColor: "rgba(212,175,55,0.12)",
  },
  orderText: {
    color: "#D4AF37",
    fontWeight: 700,
    fontSize: "0.88rem",
    textAlign: "center",
  },
  switchWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  switchBtn: (on) => ({
    width: "58px",
    height: "30px",
    borderRadius: "999px",
    border: "1px solid rgba(212,175,55,0.35)",
    backgroundColor: on ? "rgba(212,175,55,0.35)" : "rgba(255,255,255,0.11)",
    position: "relative",
    cursor: "pointer",
  }),
  switchDot: (on) => ({
    position: "absolute",
    top: "3px",
    left: on ? "30px" : "4px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    backgroundColor: on ? "#D4AF37" : "#FFFFFF",
    transition: "left 0.2s ease",
  }),
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  btnGhost: {
    border: "1px solid rgba(212,175,55,0.28)",
    borderRadius: "8px",
    background: "transparent",
    color: "#D4AF37",
    fontSize: "0.82rem",
    fontWeight: 700,
    padding: "0.45rem 0.75rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  btnDanger: {
    border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "8px",
    background: "rgba(239,68,68,0.1)",
    color: "#FCA5A5",
    fontSize: "0.82rem",
    fontWeight: 700,
    padding: "0.45rem 0.75rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  },
  formTitle: {
    fontSize: "1rem",
    color: "#D4AF37",
    margin: "0 0 0.8rem",
    fontWeight: 800,
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.8rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  label: {
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.7)",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: "0.6rem 0.8rem",
    borderRadius: "9px",
    border: "1px solid rgba(212,175,55,0.25)",
    backgroundColor: "rgba(38,50,56,0.75)",
    color: "#FFFFFF",
    fontFamily: "'Tajawal', sans-serif",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  rowEnd: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    justifyContent: "flex-end",
    marginTop: "0.8rem",
  },
  saveBtn: {
    border: "none",
    borderRadius: "10px",
    backgroundColor: "#FFD700",
    color: "#263238",
    fontWeight: 800,
    fontSize: "0.9rem",
    padding: "0.6rem 1rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
  },
};

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  buttonText: "",
  buttonLink: "",
  backgroundColor: "#263238",
  textColor: "#FFFFFF",
  isActive: true,
  order: 1,
};

function HeroSliderManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    const q = query(collection(db, "heroSlides"), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({
        id: d.id,
        slideId: d.id,
        ...d.data(),
      }));
      setSlides(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const nextOrder = useMemo(() => {
    if (!slides.length) return 1;
    return Math.max(...slides.map((s) => Number(s.order || 0))) + 1;
  }, [slides]);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, order: nextOrder });
    setShowForm(true);
  };

  const openEdit = (slide) => {
    setEditingId(slide.id);
    setForm({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      buttonText: slide.buttonText || "",
      buttonLink: slide.buttonLink || "",
      backgroundColor: slide.backgroundColor || "#263238",
      textColor: slide.textColor || "#FFFFFF",
      isActive: !!slide.isActive,
      order: Number(slide.order || 1),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "heroSlides", editingId), {
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          buttonText: form.buttonText.trim(),
          buttonLink: form.buttonLink.trim(),
          backgroundColor: form.backgroundColor,
          textColor: form.textColor,
          isActive: !!form.isActive,
          order: Number(form.order || 1),
        });
      } else {
        const ref = await addDoc(collection(db, "heroSlides"), {
          title: form.title.trim(),
          subtitle: form.subtitle.trim(),
          buttonText: form.buttonText.trim(),
          buttonLink: form.buttonLink.trim(),
          backgroundColor: form.backgroundColor,
          textColor: form.textColor,
          isActive: !!form.isActive,
          order: Number(form.order || 1),
          createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, "heroSlides", ref.id), { slideId: ref.id });
      }
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "heroSlides", id));
  };

  const handleToggle = async (slide) => {
    await updateDoc(doc(db, "heroSlides", slide.id), {
      isActive: !slide.isActive,
    });
  };

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section style={S.wrap}>
      <h2 style={S.title}>Hero Slider Manager</h2>

      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
            Manage hero slides from Firestore collection: <strong style={{ color: "#D4AF37" }}>heroSlides</strong>
          </p>
          <button style={S.btnGhost} onClick={openNew}>
            <FiPlus size={14} /> Add New Slide
          </button>
        </div>

        {loading ? (
          <GoldSpinner fullScreen={false} size={36} />
        ) : slides.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.5)", margin: "0.4rem 0" }}>No slides found. Add your first slide.</p>
        ) : (
          slides.map((slide) => (
            <div key={slide.id} style={S.listRow}>
              <div style={{ ...S.preview, backgroundColor: slide.backgroundColor || "#263238", color: slide.textColor || "#FFFFFF" }}>
                <p style={S.previewTitle}>{slide.title || "Untitled slide"}</p>
                <p style={S.previewSub}>{slide.subtitle || "No subtitle"}</p>
                <span style={{ ...S.previewBtn, color: slide.textColor || "#FFFFFF" }}>
                  {slide.buttonText || "Button"}
                </span>
              </div>

              <div style={S.orderText}>Order #{Number(slide.order || 0)}</div>

              <div style={S.switchWrap}>
                <button type="button" style={S.switchBtn(!!slide.isActive)} onClick={() => handleToggle(slide)} aria-label="Toggle active">
                  <span style={S.switchDot(!!slide.isActive)} />
                </button>
              </div>

              <div style={S.actions}>
                <button style={S.btnGhost} onClick={() => openEdit(slide)}>
                  <FiEdit2 size={14} /> Edit
                </button>
                <button style={S.btnDanger} onClick={() => handleDelete(slide.id)}>
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div style={S.card}>
          <p style={S.formTitle}>{editingId ? "Edit Slide" : "Add New Slide"}</p>

          <div style={S.formGrid}>
            <div style={S.field}>
              <label style={S.label}>Title</label>
              <input style={S.input} value={form.title} onChange={(e) => setField("title", e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Subtitle</label>
              <input style={S.input} value={form.subtitle} onChange={(e) => setField("subtitle", e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Button Text</label>
              <input style={S.input} value={form.buttonText} onChange={(e) => setField("buttonText", e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Button Link</label>
              <input style={S.input} value={form.buttonLink} onChange={(e) => setField("buttonLink", e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Background Color</label>
              <input style={{ ...S.input, padding: "0.35rem 0.5rem" }} type="color" value={form.backgroundColor} onChange={(e) => setField("backgroundColor", e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Text Color</label>
              <input style={{ ...S.input, padding: "0.35rem 0.5rem" }} type="color" value={form.textColor} onChange={(e) => setField("textColor", e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Order</label>
              <input style={S.input} type="number" min="1" value={form.order} onChange={(e) => setField("order", Number(e.target.value || 1))} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Active</label>
              <select style={S.input} value={form.isActive ? "true" : "false"} onChange={(e) => setField("isActive", e.target.value === "true") }>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div style={S.rowEnd}>
            <button style={S.btnGhost} onClick={closeForm}>Cancel</button>
            <button style={{ ...S.saveBtn, opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
              <FiSave size={14} /> {editingId ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default HeroSliderManager;
