import React, { useState } from 'react';
import { FaFlag, FaPaperPlane } from 'react-icons/fa';

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    type: 'content',
    url: '',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Report submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ type: 'content', url: '', description: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <FaFlag className="text-6xl mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Report an Issue</h1>
            <p className="text-lg text-blue-100">Help us keep our community safe</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Report Submitted!</h3>
              <p className="text-gray-600">Our team will review it within 24 hours.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit a Report</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Issue Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                  >
                    <option value="content">Inappropriate Content</option>
                    <option value="spam">Spam or Scam</option>
                    <option value="harassment">Harassment or Bullying</option>
                    <option value="copyright">Copyright Violation</option>
                    <option value="technical">Technical Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">URL or Location (optional)</label>
                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    placeholder="https://example.com/post/123"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                    placeholder="Please provide details about the issue..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <FaPaperPlane />
                  Submit Report
                </button>
              </form>

              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> All reports are reviewed by our moderation team. 
                  False reports may result in account restrictions.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;

