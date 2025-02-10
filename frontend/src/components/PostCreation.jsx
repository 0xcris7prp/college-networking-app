import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { Image, Loader } from "lucide-react";


const PostCreation = ({ user }) => {

    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const queryClient = useQueryClient();

    const { mutate: createPostMutation, isPending } = useMutation({
        mutationFn: async (postData) => {
            const res = await axiosInstance.post("/posts/create", postData, {
                headers: { "Content-Type": "application/json" }
            })
            return res.data
        },
        onSuccess: () => {
            resetForm();
            toast.success("Post created successfully")
            queryClient.invalidateQueries({queryKey: ["posts"]});
        },
        onError: (err) => {
            toast.error(err.response.data.message || "Failed to create post")
        }

    });

    const handlePostCreation = async () => {
        try {
            const postData = { content }
            // Only add the image if one is selected
            if (image) {
                postData.image = await readFileAsDataURL(image);
            }

            // Trigger the mutation
            createPostMutation(postData)
        } catch (error) {
            console.error("Error in handlePostCreation", error)
        }
    }

    //to reset form after successful creation
    const resetForm = () => {
        setContent("")
        setImage(null)
        setImagePreview(null)
    }

    //to handle event when user update img from there machine
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            readFileAsDataURL(file).then(setImagePreview);//to convert the file into a data URL format (which can be displayed directly on a webpage).
        } else {
            setImagePreview(null);
        }
    };
    //converts the image file into a format that can be displayed in HTML (data URL), using a Promise to handle the async file reading process.
    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader(); //built-in JavaScript tool to read files like images, text, etc.
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);//way of encoding the file into a string that can be used in an <img> tag to display the image.

        });
    };

    return (
        <div className='bg-secondary rounded-lg shadow mb-4 p-4'>
            <div className='flex space-x-4'>
                <img src={user.profilePicture?.trim() || "/avatar.png"} alt={user.name} className='size-12 rounded-full' />
                <textarea
                    placeholder="What's on your mind?"
                    className='w-full p-3 rounded-lg bg-base-100 hover:bg-base-200 focus:bg-base-200 focus:outline-none
                resize-none transition-colors duration-200 min-h-[100px]'
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            {imagePreview && (
                <div className='mt-4'>
                    <img src={imagePreview} alt='Selected' className='w-full h-auto rounded-lg' />
                </div>
            )}
            <div className='flex justify-between items-center mt-4'>
                <div className='flex space-x-4'>
                    <label className='flex items-center text-info hover:text-info-dark transition-colors duration-200 cursor-pointer'>
                        <Image size={20} className='mr-2' />
                        <span>Photo</span>
                        <input type='file' accept='image/*' className='hidden' onChange={handleImageChange} />
                    </label>
                </div>

                <button
                    className='bg-primary text-white rounded-lg px-4 py-2 hover:bg-primary-dark transition-colors duration-200'
                    onClick={handlePostCreation}
                    disabled={isPending}
                >
                    {isPending ? <Loader className='size-5 animate-spin' /> : "Share"}
                </button>
            </div>
        </div>
    )
}

export default PostCreation;