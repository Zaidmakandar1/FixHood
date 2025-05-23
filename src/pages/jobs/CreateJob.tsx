import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';
import { createJob } from '../../services/jobService';
import { JobStatus } from '../../types/job';

type FormInputs = {
  title: string;
  description: string;
  category?: string;
  estimatedBudget?: string;
  tags?: string[];
};

const CreateJob = () => {
  const navigate = useNavigate();
  const { coordinates, error: locationError } = useGeolocation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };
  
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!coordinates) {
      setError('Location information is required. Please enable location access.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare job data
      const jobData = {
        ...data,
        location: coordinates,
        image: imagePreview, // In a real app, we'd upload this to a server
        status: 'open' as JobStatus,
        tags: data.tags || [],
        createdAt: new Date().toISOString()
      };
      
      // Create the job
      await createJob(jobData);
      
      // Navigate to the homeowner dashboard
      navigate('/homeowner');
    } catch (error: any) {
      console.error('Error creating job:', error);
      setError(error.message || 'Failed to create job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container-custom py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Post a New Job</h1>
        <p className="text-gray-600 mb-6">Describe what needs fixing and get connected with qualified professionals</p>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {locationError && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-600">
                <strong>Location access required:</strong> {locationError}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                id="title"
                type="text"
                className={`input ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="e.g., Leaking Kitchen Faucet"
                {...register('title', { required: 'Title is required' })}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
            
            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                id="description"
                rows={5}
                className={`input ${errors.description ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Describe the problem in detail. What needs to be fixed? When did it start? Any relevant details..."
                {...register('description', { 
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Description should be at least 10 characters' }
                })}
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                className="input"
                {...register('category')}
              >
                <option value="">Select a category</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="carpentry">Carpentry</option>
                <option value="painting">Painting</option>
                <option value="appliance">Appliance Repair</option>
                <option value="hvac">HVAC</option>
                <option value="general">General Maintenance</option>
              </select>
            </div>
            
            {/* Estimated Budget */}
            <div>
              <label htmlFor="estimatedBudget" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Budget (Optional)
              </label>
              <input
                id="estimatedBudget"
                type="text"
                className="input"
                placeholder="e.g., $100-200"
                {...register('estimatedBudget')}
              />
            </div>
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Photos (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-auto object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                        >
                          <span>Upload a photo</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Creating Job...
                  </>
                ) : (
                  'Post Job'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;