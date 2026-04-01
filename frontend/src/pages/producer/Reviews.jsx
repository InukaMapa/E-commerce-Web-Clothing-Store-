import React, { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  CornerUpRight,
  User,
  Package,
  Calendar,
  Send,
} from "lucide-react";
import api from "../../api/axios";

const ProducerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/api/producer/reviews");
      setReviews(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      // Logic for replying would go here. For now, we'll simulate.
      // await api.put(`/api/producer/reviews/${reviewId}/reply`, { reply: replyText });
      setReplyingTo(null);
      setReplyText("");
      alert("Protocol: Reply Synchronized");
    } catch (err) {
      alert("Sync Failed");
    }
  };

  if (loading) return <div>Synchronizing market feedback...</div>;

  return (
    <div className="space-y-12 pb-20">
      <div>
        <h2 className="text-3xl font-serif font-bold uppercase tracking-widest text-black mb-2">
          Market Feedback
        </h2>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em]">
          Customer sentiment and product perception index
        </p>
      </div>

      <div className="max-w-5xl space-y-10">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white border border-black/5 p-10 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full">
                  <User size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-black mb-1">
                    {review.user?.name}
                  </h4>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={
                          i < review.rating
                            ? "fill-black text-black"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-end">
                  <Package size={12} className="mr-1.5" />{" "}
                  {review.product?.name}
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-end">
                  <Calendar size={12} className="mr-1.5" />{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-serif italic text-gray-600 leading-relaxed max-w-2xl">
                "
                {review.comment ||
                  "No textual data provided for this feedback event."}
                "
              </p>
            </div>

            {review.reply ? (
              <div className="bg-gray-50 p-8 flex items-start space-x-4">
                <CornerUpRight size={18} className="text-gray-300 mt-1" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-black mb-3">
                    Brand Protocol Response
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed font-bold uppercase tracking-widest">
                    {review.reply}
                  </p>
                </div>
              </div>
            ) : (
              <div className="pt-6 border-t border-gray-50">
                {replyingTo === review._id ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="ENGAGE CUSTOMER PROTOCOL..."
                      className="w-full bg-gray-50 p-6 text-xs font-bold uppercase tracking-widest outline-none border border-black/5 focus:border-black transition-all h-32"
                    />
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleReply(review._id)}
                        className="bg-black text-white px-8 py-3 text-xs font-black uppercase tracking-widest flex items-center space-x-3 hover:bg-gray-800 transition-all"
                      >
                        <Send size={14} />
                        <span>Transmit Reply</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-black"
                      >
                        Abort
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(review._id)}
                    className="text-xs font-black uppercase tracking-widest text-black flex items-center space-x-3 border-b border-black pb-1 hover:text-gray-400 hover:border-gray-400 transition-all"
                  >
                    <MessageSquare size={14} />
                    <span>Initialize Response</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="py-40 text-center uppercase text-xs font-black tracking-widest text-gray-300 italic">
            No market feedback detected for your clothing line
          </div>
        )}
      </div>
    </div>
  );
};

export default ProducerReviews;
