import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient"
import SubmissionHistory from "../components/SubmissionHistory"
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';
import { Settings, Play, Send, ChevronDown } from 'lucide-react';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript',
  python: 'Python',
  csharp: 'C#',
  typescript: 'TypeScript',
  go: 'Go',
  rust: 'Rust'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        setProblem(response.data);

        // Safe access to start code
        const startCodeObj = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]);
        const initialCode = startCodeObj ? startCodeObj.initialCode : '// Language template not available';

        setCode(initialCode);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Update code when language changes
  useEffect(() => {
    if (problem) {
      const startCodeObj = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]);
      const initialCode = startCodeObj ? startCodeObj.initialCode : '// Language template not available';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');

    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');

    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      case 'python': return 'python';
      case 'csharp': return 'csharp';
      case 'typescript': return 'typescript';
      case 'go': return 'go';
      case 'rust': return 'rust';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-base-100 font-sans text-base-content overflow-hidden">
      {/* Left Panel */}
      <div className="w-1/2 flex flex-col border-r border-base-300">
        {/* Left Tabs */}
        <div className="tabs tabs-lifted bg-base-200 pt-2 px-2">
          {['description', 'editorial', 'solutions', 'submissions', 'chatAI'].map(tab => (
            <button
              key={tab}
              className={`tab tab-lifted ${activeLeftTab === tab ? 'tab-active font-semibold' : ''}`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab === 'chatAI' ? 'Chat AI' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-base-100">
          {problem && (
            <>
              {activeLeftTab === 'description' && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-3xl font-bold">{problem.title}</h1>
                    <div className={`badge badge-lg badge-outline font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </div>
                    {problem.tags && <div className="badge badge-lg badge-primary">{problem.tags}</div>}
                  </div>

                  <div className="prose prose-base max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {problem.description}
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Examples</h3>
                    <div className="space-y-6">
                      {problem.visibleTestCases.map((example, index) => (
                        <div key={index} className="bg-base-200 p-5 rounded-xl border border-base-300 shadow-sm">
                          <h4 className="font-semibold mb-3 text-lg">Example {index + 1}</h4>
                          <div className="space-y-2 font-mono text-sm">
                            <div><span className="text-base-content/70">Input:</span> <span className="text-primary">{example.input}</span></div>
                            <div><span className="text-base-content/70">Output:</span> <span className="text-secondary">{example.output}</span></div>
                            {example.explanation && <div><span className="text-base-content/70">Explanation:</span> {example.explanation}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === 'editorial' && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold mb-6">Editorial</h2>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'solutions' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Solutions</h2>
                  <div className="space-y-6">
                    {problem.referenceSolution?.map((solution, index) => (
                      <div key={index} className="border border-base-300 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-base-200 px-4 py-3 border-b border-base-300">
                          <h3 className="font-semibold">{solution?.language} Solution</h3>
                        </div>
                        <div className="p-0">
                          <Editor
                            height="300px"
                            language={getLanguageForMonaco(solution?.language?.toLowerCase())}
                            value={solution?.completeCode}
                            theme="vs-dark"
                            options={{ readOnly: true, minimap: { enabled: false } }}
                          />
                        </div>
                      </div>
                    )) || <p className="text-base-content/60 italic">Solutions will be available after you solve the problem.</p>}
                  </div>
                </div>
              )}

              {activeLeftTab === 'submissions' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold">My Submissions</h2>
                  </div>
                  <div className="text-base-content/80">
                    <SubmissionHistory problemId={problemId} />
                  </div>
                </div>
              )}

              {activeLeftTab === 'chatAI' && (
                <div className="h-full">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold">AI Assistant</h2>
                    <p className="text-base-content/60 text-sm">Get hints, debugging help, and explanations.</p>
                  </div>
                  <div className="h-[calc(100%-80px)]">
                    <ChatAi problem={problem}></ChatAi>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex flex-col bg-base-100">
        {/* Right Tabs */}
        <div className="tabs tabs-lifted bg-base-200 pt-2 px-2">
          <button
            className={`tab tab-lifted ${activeRightTab === 'code' ? 'tab-active font-semibold' : ''}`}
            onClick={() => setActiveRightTab('code')}
          >
            Code
          </button>
          <button
            className={`tab tab-lifted ${activeRightTab === 'testcase' ? 'tab-active font-semibold' : ''}`}
            onClick={() => setActiveRightTab('testcase')}
          >
            Testcase
          </button>
          <button
            className={`tab tab-lifted ${activeRightTab === 'result' ? 'tab-active font-semibold' : ''}`}
            onClick={() => setActiveRightTab('result')}
          >
            Result
          </button>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#1e1e1e]">
          {/* Using standard VS Code dark bg color for seamless look */}

          {activeRightTab === 'code' && (
            <div className="flex-1 flex flex-col h-full">
              {/* Language Selector Bar */}
              <div className="flex justify-between items-center px-4 py-2 bg-base-200 border-b border-base-300">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Language:</span>
                  <select
                    className="select select-bordered select-sm w-full max-w-xs font-mono"
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                  >
                    {Object.entries(langMap).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm btn-square" title="Settings">
                    <Settings size={18} />
                  </button>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 relative">
                <Editor
                  height="100%"
                  language={getLanguageForMonaco(selectedLanguage)}
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'Consolas', monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'line',
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    readOnly: false,
                    cursorStyle: 'line',
                    mouseWheelZoom: true,
                    padding: { top: 10 }
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-base-200 border-t border-base-300 flex justify-between items-center">
                <button
                  className="btn btn-ghost btn-sm text-base-content/70"
                  onClick={() => setActiveRightTab('testcase')}
                >
                  Console
                </button>
                <div className="flex gap-3">
                  <button
                    className={`btn btn-secondary btn-sm px-6 ${loading ? 'loading' : ''}`}
                    onClick={handleRun}
                    disabled={loading}
                  >
                    {!loading && <Play size={16} fill="currentColor" />} Run
                  </button>
                  <button
                    className={`btn btn-primary btn-sm px-6 ${loading ? 'loading' : ''}`}
                    onClick={handleSubmitCode}
                    disabled={loading}
                  >
                    {!loading && <Send size={16} />} Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'testcase' && (
            <div className="flex-1 p-6 overflow-y-auto bg-base-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                Test Results
                {runResult && (
                  <span className={`badge ${runResult.success ? 'badge-success' : 'badge-error'}`}>
                    {runResult.success ? 'Passed' : 'Failed'}
                  </span>
                )}
              </h3>

              {runResult ? (
                <div className="space-y-4">
                  {runResult.success && (
                    <div className="stats shadow bg-base-200 w-full mb-4">
                      <div className="stat">
                        <div className="stat-title">Runtime</div>
                        <div className="stat-value text-xl">{runResult.runtime} sec</div>
                      </div>
                      <div className="stat">
                        <div className="stat-title">Memory</div>
                        <div className="stat-value text-xl">{runResult.memory} KB</div>
                      </div>
                    </div>
                  )}

                  {!runResult.success && runResult.error && (
                    <div className="alert alert-error shadow-lg mb-4">
                      <div>
                        <span className="font-bold">Error:</span>
                        <pre className="whitespace-pre-wrap text-xs mt-1">{runResult.error}</pre>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {runResult.testCases && runResult.testCases.length > 0 ? (
                      runResult.testCases.map((tc, i) => (
                        <div key={i} className={`collapse collapse-arrow border border-base-300 bg-base-200 rounded-lg`}>
                          <input type="checkbox" defaultChecked={!runResult.success || i === 0} />
                          <div className="collapse-title font-medium flex justify-between items-center">
                            <span>Test Case {i + 1}</span>
                            <span className={tc.status_id === 3 ? 'text-success font-bold' : 'text-error font-bold'}>
                              {tc.status_id === 3 ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                          <div className="collapse-content">
                            <div className="flex flex-col gap-2 text-sm font-mono mt-2">
                              <div className="p-3 bg-base-300 rounded">
                                <span className="text-base-content/60 block mb-1 uppercase text-xs font-bold">Input</span>
                                {tc.stdin}
                              </div>
                              <div className="flex gap-4">
                                <div className="p-3 bg-base-300 rounded flex-1">
                                  <span className="text-base-content/60 block mb-1 uppercase text-xs font-bold">Expected Output</span>
                                  {tc.expected_output}
                                </div>
                                <div className="p-3 bg-base-300 rounded flex-1">
                                  <span className="text-base-content/60 block mb-1 uppercase text-xs font-bold">Your Output</span>
                                  {tc.stdout || (tc.stderr ? <span className="text-error">{tc.stderr}</span> : <span className="text-base-content/30 italic">No output</span>)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      !runResult.error && <div className="text-base-content/60 italic">No detailed test cases available.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-base-content/50 border-2 border-dashed border-base-300 rounded-xl">
                  <Play size={48} className="mb-4 opacity-20" />
                  <p>Run your code to see test results</p>
                </div>
              )}
            </div>
          )}

          {activeRightTab === 'result' && (
            <div className="flex-1 p-6 overflow-y-auto bg-base-100">
              <div className="flex items-center gap-3 mb-6">
                <h3 className="font-bold text-lg">Submission Result</h3>
              </div>

              {submitResult ? (
                <div className={`card bg-base-200 shadow-lg border-l-8 ${submitResult.accepted ? 'border-success' : 'border-error'}`}>
                  <div className="card-body">
                    {submitResult.accepted ? (
                      <>
                        <h4 className="card-title text-success text-2xl">🎉 Accepted</h4>
                        <div className="stats shadow bg-base-100 mt-4">
                          <div className="stat">
                            <div className="stat-title">Test Cases</div>
                            <div className="stat-value text-lg">{submitResult.passedTestCases}/{submitResult.totalTestCases}</div>
                          </div>
                          <div className="stat">
                            <div className="stat-title">Runtime</div>
                            <div className="stat-value text-lg">{submitResult.runtime} sec</div>
                          </div>
                          <div className="stat">
                            <div className="stat-title">Memory</div>
                            <div className="stat-value text-lg">{submitResult.memory} KB</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4 className="card-title text-error text-2xl">❌ {submitResult.error || 'Wrong Answer'}</h4>
                        <div className="mt-4">
                          <p className="font-mono text-base-content/80 mb-2">
                            Passed {submitResult.passedTestCases} of {submitResult.totalTestCases} test cases.
                          </p>
                          <progress className="progress progress-error w-56" value={submitResult.passedTestCases} max={submitResult.totalTestCases}></progress>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-base-content/50 border-2 border-dashed border-base-300 rounded-xl">
                  <Send size={48} className="mb-4 opacity-20" />
                  <p>Submit your code to see results</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;