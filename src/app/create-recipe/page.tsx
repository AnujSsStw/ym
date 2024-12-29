"use client";

import { useState } from "react";
import { UploadButton, UploadDropzone } from "../_components/uploadthing";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function UserRecipeForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState("");
  const router = useRouter();
  const submitUserRecipe = api.post.createUserRecipe.useMutation({
    onSuccess: () => {
      router.push("/my-recipes");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !ingredients || !instructions) {
      alert("Please fill out all fields");
      return;
    }
    if (image) {
      await submitUserRecipe.mutateAsync({
        title,
        description,
        ingredients,
        instructions,
        image,
      });
      setTitle("");
      setDescription("");
      setIngredients("");
      setInstructions("");
      setImage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-lg border p-6 shadow-lg"
    >
      <h2 className="mb-4 text-2xl font-semibold">Submit Your Recipe</h2>
      <div className="mb-4">
        <label htmlFor="title" className="mb-2 block">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="mb-2 block">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border p-2"
          rows={3}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="ingredients" className="mb-2 block">
          Ingredients
        </label>
        <textarea
          id="ingredients"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="w-full rounded border p-2"
          rows={4}
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="instructions" className="mb-2 block">
          Instructions
        </label>
        <textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full rounded border p-2"
          rows={6}
          required
        />
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold tracking-wide text-gray-500">
            Attach Image
          </label>
          {image && (
            <button
              type="button"
              onClick={() => setImage("")}
              className="px-3 py-1 hover:bg-gray-200 focus:outline-none"
            >
              + edit image
            </button>
          )}
        </div>
        {image ? (
          <div className="col-span-6 shadow sm:col-span-4">
            <Image
              src={image}
              alt="productImage"
              width="1000"
              height="100"
              className="h-[250px] w-full object-cover"
            />
          </div>
        ) : (
          <UploadDropzone
            className="w-full rounded border p-2"
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              console.log("Files: ", res);
              if (!res[0]) return;
              setImage(res[0].url);
            }}
            onUploadError={(error: Error) => {
              // Do something with the error.
              alert(`ERROR! ${error.message}`);
            }}
          />
        )}
      </div>
      <button
        type="submit"
        className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
      >
        Submit Recipe
      </button>
    </form>
  );
}
