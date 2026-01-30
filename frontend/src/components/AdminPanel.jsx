import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../utils/axiosClient';
import { useNavigate } from 'react-router';

// Zod schema matching the problem schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().optional()
    })
  ).optional(),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().optional()
    })
  ).optional()
});

function AdminPanel() {
  const navigate = useNavigate();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({
    control,
    name: 'visibleTestCases'
  });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({
    control,
    name: 'hiddenTestCases'
  });

  const onSubmit = async (data) => {
    try {
      await axiosClient.post('/problem/create', data);
      alert('Problem created successfully!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Problem Creator
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Craft new challenges for the community. Define constraints, test cases, and solution templates.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Basic Information */}
          <section className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Basic Details</h2>
            </div>

            <div className="grid gap-8">
              <div className="form-control w-full">
                <label className="label mb-2">
                  <span className="label-text text-slate-300 font-medium">Problem Title</span>
                </label>
                <input
                  {...register('title')}
                  placeholder="e.g., Two Sum"
                  className={`input input-lg bg-slate-950 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full rounded-xl transition-all ${errors.title && 'input-error'}`}
                />
                {errors.title && (
                  <span className="text-red-400 text-sm mt-2">{errors.title.message}</span>
                )}
              </div>

              <div className="form-control w-full">
                <label className="label mb-2">
                  <span className="label-text text-slate-300 font-medium">Description</span>
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Describe the problem statement..."
                  className={`textarea textarea-lg bg-slate-950 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full h-48 rounded-xl leading-relaxed transition-all ${errors.description && 'textarea-error'}`}
                />
                {errors.description && (
                  <span className="text-red-400 text-sm mt-2">{errors.description.message}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="form-control w-full">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-medium">Difficulty</span>
                  </label>
                  <select
                    {...register('difficulty')}
                    className={`select select-lg bg-slate-950 border-slate-700 focus:border-indigo-500 w-full rounded-xl ${errors.difficulty && 'select-error'}`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-medium">Topic Tag</span>
                  </label>
                  <select
                    {...register('tags')}
                    className={`select select-lg bg-slate-950 border-slate-700 focus:border-indigo-500 w-full rounded-xl ${errors.tags && 'select-error'}`}
                  >
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Test Cases */}
          <section className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Test Cases</h2>
            </div>

            {/* Visible Test Cases */}
            <div className="space-y-4 mb-10">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">Visible Examples</h3>
                  <p className="text-slate-500 text-sm">Visible to users as examples.</p>
                </div>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="btn btn-sm bg-emerald-600 hover:bg-emerald-500 text-white border-none gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Add Case
                </button>
              </div>

              <div className="grid gap-4">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="collapse collapse-arrow bg-slate-950 border border-slate-800 rounded-xl">
                    <input type="checkbox" defaultChecked />
                    <div className="collapse-title text-base font-medium flex items-center gap-4">
                      <span className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-400">Case {index + 1}</span>
                      <span className="text-slate-300 truncate opacity-75">Expand to edit details</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeVisible(index); }}
                        className="btn btn-ghost btn-xs text-error z-10 ml-auto"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="collapse-content">
                      <div className="grid gap-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="form-control">
                            <label className="label text-xs uppercase font-bold text-slate-500">Input</label>
                            <input
                              {...register(`visibleTestCases.${index}.input`)}
                              placeholder="e.g., [2, 7, 11, 15], 9"
                              className="input input-bordered bg-slate-900 font-mono text-sm"
                            />
                          </div>
                          <div className="form-control">
                            <label className="label text-xs uppercase font-bold text-slate-500">Output</label>
                            <input
                              {...register(`visibleTestCases.${index}.output`)}
                              placeholder="e.g., [0, 1]"
                              className="input input-bordered bg-slate-900 font-mono text-sm"
                            />
                          </div>
                        </div>
                        <div className="form-control">
                          <label className="label text-xs uppercase font-bold text-slate-500">Explanation</label>
                          <textarea
                            {...register(`visibleTestCases.${index}.explanation`)}
                            placeholder="Explanation"
                            className="textarea textarea-bordered bg-slate-900 h-20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div className="space-y-4 pt-6 border-t border-slate-800">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">Hidden Test Cases</h3>
                  <p className="text-slate-500 text-sm">Used for grading submissions.</p>
                </div>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="btn btn-sm bg-indigo-600 hover:bg-indigo-500 text-white border-none gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  Add Hidden
                </button>
              </div>

              <div className="grid gap-4">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative group hover:border-indigo-500/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="absolute top-2 right-2 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <div className="space-y-3">
                      <div className="form-control">
                        <label className="label text-[10px] uppercase font-bold text-slate-500 tracking-wider">Input</label>
                        <input
                          {...register(`hiddenTestCases.${index}.input`)}
                          className="input input-sm input-bordered bg-slate-900 font-mono"
                        />
                      </div>
                      <div className="form-control">
                        <label className="label text-[10px] uppercase font-bold text-slate-500 tracking-wider">Output</label>
                        <input
                          {...register(`hiddenTestCases.${index}.output`)}
                          className="input input-sm input-bordered bg-slate-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Code Templates */}
          <section className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Code Templates</h2>
            </div>

            <div className="space-y-6">
              {[0, 1, 2].map((index) => (
                <div key={index} className="collapse collapse-plus bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <input type="checkbox" />
                  <div className="collapse-title text-lg font-medium flex items-center gap-3 py-4">
                    <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-orange-500' : 'bg-yellow-400'}`}></div>
                    <span>{index === 0 ? 'C++' : index === 1 ? 'Java' : 'JavaScript'}</span>
                  </div>
                  <div className="collapse-content bg-slate-900/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 pb-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-mono text-xs uppercase tracking-wider text-slate-400">Starter Code</span>
                        </label>
                        <div className="mockup-code bg-slate-950 text-base-content min-w-0 border border-slate-800">
                          <textarea
                            {...register(`startCode.${index}.initialCode`)}
                            className="w-full bg-transparent font-mono text-sm h-64 p-6 focus:outline-none resize-none leading-relaxed text-slate-300"
                            placeholder="// Write starter code here..."
                          />
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-mono text-xs uppercase tracking-wider text-slate-400">Reference Solution</span>
                        </label>
                        <div className="mockup-code bg-slate-950 text-base-content min-w-0 border border-slate-800">
                          <textarea
                            {...register(`referenceSolution.${index}.completeCode`)}
                            className="w-full bg-transparent font-mono text-sm h-64 p-6 focus:outline-none resize-none leading-relaxed text-slate-300"
                            placeholder="// Write complete solution here..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="sticky bottom-6 z-20 pt-4">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent -z-10 h-32 -top-20 pointer-events-none"></div>
            <button
              type="submit"
              className="btn btn-lg w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-none shadow-lg shadow-indigo-500/20 rounded-2xl font-bold tracking-wide transform transition-all active:scale-[0.99]"
            >
              Create Problem Challenge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;
