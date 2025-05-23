import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Camera, Loader2, Upload, X, CheckCircle } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';
import { createJob, enhanceJobDescription } from '../../services/jobService';

type FormInputs = {
  title: string;
  description: string;
  category?: string;
  estimatedBudget?: string;
};

const CreateJob = () => {
  const navigate = useNavigate();
  const { coordinates, error: locationError } = useGeolocation();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormInputs>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedDescription, setEnhancedDescription] = useState<string | null>(null);
  const [autoTags, setAutoTags] = useState<string[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const description = watch('description');
  
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
  
  const handleEnhance = async () => {
    if (!description || description.length < 10) return;
    
    setIsEnhancing(true);
    try {
      const result = await enhanceJobDescription(description);
      setEnhancedDescription(result.enhancedDescription);
      setAutoTags(result.tags);
    } catch (error) {
      console.error('Error enhancing description:', error);
    } finally {
      setIsEnhancing(false);
    }
  };
  
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!coordinates) {
      alert('Location information is required. Please enable location access.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Prepare job data
      const jobData = {
        ...data,
        description: enhancedDescription || data.description,
        location: coordinates,
        tags: autoTags,
        image: imagePreview, // In a real app, we'd upload this to a server
        status: 'open',
        createdAt: new Date().toISOString()
      };
      
      // Create the job
      await createJob(jobData);
      
      // Navigate to the homeowner dashboard
      navigate('/homeowner');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
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
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Job Description
                </label>
                <button
                  type="button"
                  className="text-xs text-primary-600 hover:text-primary-800 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleEnhance}
                  disabled={isEnhancing || !description || description.length < 10}
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 size={12} className="animate-spin mr-1" />
                      Enhancing...
                    </>
                  ) : enhancedDescription ? (
                    <>
                      <CheckCircle size={12} className="mr-1" />
                      Enhanced
                    </>
                  ) : (
                    'Enhance with AI'
                  )}
                </button>
              </div>
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
              
              {/* Enhanced description preview */}
              {enhancedDescription && (
                <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <p className="text-xs text-primary-800 font-medium mb-1">AI Enhanced Description:</p>
                  <p className="text-sm text-gray-800">{enhancedDescription}</p>
                  
                  {autoTags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-primary-800 font-medium mb-1">Suggested Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {autoTags.map((tag, index) => (
                          <span key={index} className="badge badge-primary">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
            
            {/* Location Warning */}
            {locationError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">
                  <strong>Location access is required:</strong> {locationError} 
                  Please enable location access in your browser settings to continue.
                </p>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Posting Job...
                </>
              ) : (
                <>
                  <Upload size={18} className="mr-2" />
                  Post Job
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;