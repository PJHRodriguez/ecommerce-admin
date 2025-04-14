import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import mongoose, { set } from "mongoose";

export default function Categories() {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get("/api/categories").then((response) => {
      setCategories(response.data);
    });
  }

  async function saveCategory(ev) {
    ev.preventDefault();
    //const parentCategoryId = mongoose.Types.ObjectId.isValid(parentCategory)
    //  ? parentCategory
    //  : null; // Fallback to null if invalid
    const data = {
      name,
      parentCategory,
      properties: properties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
      setEditedCategory(null);
    } else {
      await axios.post("/api/categories", data);
    }
    setName("");
    setParentCategory("");
    setProperties([]);
    fetchCategories();
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name: name,
        values: values.join(","),
      }))
    );
  }
  function deleteCategory(category) {
    Swal.fire({
      title: "¿Está seguro?",
      text: `¿Está seguro de que desea eliminar ${category.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar!",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { _id } = category;
        await axios.delete("/api/categories?_id=" + _id, { _id });
        fetchCategories();
      }
    });
  }

  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }

  function handlePropertyNameChange(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }

  function handlePropertyValuesChange(index, property, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }

  return (
    <Layout>
      <h1>Categorias</h1>

      <label>
        {editedCategory
          ? `Editar categoria ${editedCategory.name}`
          : "Nombre de la nueva categoria"}
      </label>
      <form onSubmit={saveCategory} className="w-full max-w-2xl">
        <div className="flex gap-1">
          <input
            className="mb-0 py-2 h-10"
            type="text"
            placeholder={"Nombre de la categoria"}
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <select
            className="h-10 mb-0"
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
          >
            <option value="">Subcategoria</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option value={category._id} key={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="block">Propiedades</label>
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2"
          >
            Agregar nueva propiedad
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div className="flex gap-1 mb-2" key={index}>
                <input
                  type="text"
                  value={property.name}
                  className="mb-0  h-10"
                  onChange={(e) =>
                    handlePropertyNameChange(index, property, e.target.value)
                  }
                  placeholder="Nombre de la propiedad(ej: Color)"
                />
                <input
                  type="text"
                  className="mb-0 h-10"
                  onChange={(e) =>
                    handlePropertyValuesChange(index, property, e.target.value)
                  }
                  value={property.values}
                  placeholder="Valores separados por coma(ej: Rojo, Verde)"
                />
                <button
                  onClick={() => removeProperty(index)}
                  className="btn-red h-10"
                  type="button"
                >
                  Eliminar
                </button>
              </div>
            ))}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setParentCategory("");
                setProperties([]);
              }}
              className="btn-red"
            >
              Cancelar
            </button>
          )}
          <button type={"submit"} className="btn-primary h-10 text-lg">
            Crear
          </button>
        </div>
      </form>

      {!editedCategory && (
        <table className="basic">
          <thead>
            <tr>
              <td>Nombre de la categoria</td>
              <td>Subcategoria</td>
              <td>Acciones</td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>
                  <td className="flex gap-1">
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-primary "
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-red mr-2"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
