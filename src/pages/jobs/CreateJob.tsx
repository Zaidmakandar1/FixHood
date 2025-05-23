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
          
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Job Title */}
            <div className="mb-6">
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
            <div className="mb-6">
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
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category (Optional)
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
                <option value="landscaping">Landscaping</option>
                <option value="general">General Maintenance</option>
              </select>
            </div>
            
            {/* Budget Estimate */}
            <div className="mb-6">
              <label htmlFor="estimatedBudget" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Budget (Optional)
              </label>
              <select
                id="estimatedBudget"
                className="input"
                {...register('estimatedBudget')}
              >
                <option value="">Select budget range</option>
                <option value="under-100">Under $100</option>
                <option value="100-250">$100 - $250</option>
                <option value="250-500">$250 - $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="over-1000">Over $1,000</option>
                <option value="not-sure">Not Sure</option>
              </select>
            </div>
            
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Photo (Optional)
              </label>
              
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden h-48 bg-gray-100">
                  <img 
                    src={imagePreview} 
                    alt="Job preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                  >
                    <X size={18} className="text-gray-700" />
                  </button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                  <div className="flex flex-col items-center justify-center">
                    <Camera size={32} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Drag a photo or click to upload</p>
                    <p className="text-xs text-gray-400">(Max size: 5MB)</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Submit Button */}
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