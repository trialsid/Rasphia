"use client";
import React, { useEffect, useState } from "react";
import type { UserProfile, Order, Product, OrderStatus } from "../types";
import EditIcon from "./icons/EditIcon";
import ProductCard from "./ProductCard";
import { ArrowLeft, User, Package, Heart } from "lucide-react";

interface ProfilePageProps {
  user: UserProfile;
  onBack: () => void;
  onInitiateCheckout: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onStartReview: (order: Order) => void;
}

const statusColors: Record<OrderStatus, string> = {
  Processing: "bg-amber-100 text-amber-800 border-amber-200",
  Shipped: "bg-blue-50 text-blue-700 border-blue-200",
  Delivered: "bg-green-50 text-green-700 border-green-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => (
  <span
    className={`px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full border ${
      statusColors[status] || "bg-stone-100 text-stone-600 border-stone-200"
    }`}
  >
    {status}
  </span>
);

const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onBack,
  onInitiateCheckout,
  onToggleWishlist,
  onStartReview,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders + user profile
  useEffect(() => {
    const loadProfileAndOrders = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          fetch(
            `/api/user/get-profile?email=${encodeURIComponent(user.email)}`
          ),
          fetch(`/api/orders?email=${encodeURIComponent(user.email)}`),
        ]);
        const profileData = await profileRes.json();
        const ordersData = await ordersRes.json();
        if (profileData) setProfile(profileData);
        if (ordersData) setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching profile/orders:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user.email) loadProfileAndOrders();
  }, [user]);

  const handleSave = async () => {
    try {
      await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      alert("✅ Profile updated");
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F8F4EF] text-stone-500">
        Loading...
      </div>
    );

  return (
    <div className="relative h-screen w-full bg-[#F8F4EF] text-stone-900 font-sans overflow-hidden p-2 sm:p-4">
      {/* Background Gradients & Blobs (Consistent with App) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF4E1] via-[#F8F1EA] to-[#F1E3D3] -z-20" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#F8DCC0] opacity-40 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-[500px] w-[500px] rounded-full bg-[#F0B9A3] opacity-30 blur-[100px]" />
      </div>

      {/* Main Floating Panel */}
      <div className="w-full max-w-full sm:max-w-xl lg:max-w-6xl mx-auto h-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="flex-shrink-0 h-16 px-4 sm:px-8 flex items-center justify-between border-b border-stone-100/50 bg-white/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-stone-200/50 text-stone-500 hover:text-stone-800 transition-colors"
              title="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-serif font-semibold text-stone-900">
              My Profile
            </h1>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 rounded-full bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors shadow-md"
            >
              Edit Details
            </button>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">
            
            {/* 1. Personal Info Section */}
            <section>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-800">
                  <User className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-xl font-serif text-stone-800">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 bg-white/40 border border-white/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                {["name", "email", "phone", "address"].map((field) => (
                  <div key={field} className="space-y-1.5">
                    <label className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-stone-400 pl-1">
                      {field === "email" ? "Email Address" : field}
                    </label>
                    {isEditing ? (
                      field === "address" ? (
                        <textarea
                          rows={2}
                          value={profile.address}
                          onChange={(e) =>
                            setProfile({ ...profile, address: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white/80 border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100/20 text-sm outline-none transition-all resize-none"
                        />
                      ) : (
                        <input
                          value={profile[field as keyof UserProfile] as string}
                          onChange={(e) =>
                            setProfile({ ...profile, [field]: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-white/80 border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100/20 text-sm outline-none transition-all"
                        />
                      )
                    ) : (
                      <div className="px-3 py-2 rounded-lg bg-white/40 border border-stone-100 text-stone-800 font-medium text-sm min-h-[38px] flex items-center">
                        {profile[field as keyof UserProfile] as string || <span className="text-stone-400 italic font-normal">Not set</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-stone-200/50">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200/50 rounded-full transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-full shadow-md transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </section>

            {/* 2. Wishlist Section */}
            <section>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 bg-rose-100 rounded-lg text-rose-800">
                  <Heart className="h-4 w-4" />
                </div>
                <h2 className="text-base sm:text-xl font-serif text-stone-800">Wishlist</h2>
              </div>

              {profile.wishlist?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {profile.wishlist.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onInitiateCheckout={onInitiateCheckout}
                      wishlist={profile.wishlist}
                      onToggleWishlist={onToggleWishlist}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-6 sm:p-8 rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 text-center">
                  <p className="text-sm text-stone-500">Your wishlist is empty.</p>
                </div>
              )}
            </section>

            {/* 3. Orders Section */}
            <section className="pb-4 sm:pb-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                 <div className="p-1.5 bg-blue-100 rounded-lg text-blue-800">
                    <Package className="h-4 w-4" />
                 </div>
                 <h2 className="text-base sm:text-xl font-serif text-stone-800">Order History</h2>
              </div>

              {orders.length ? (
                <div className="grid gap-3 sm:gap-4">
                  {orders.map((order) => (
                    <div key={order.id}
                      className="group flex items-center gap-4 sm:gap-5 p-3 sm:p-4 bg-white/60 border border-white/60 rounded-xl sm:rounded-2xl hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg sm:rounded-xl bg-stone-100 border border-stone-200/50 overflow-hidden flex-shrink-0">
                        <img
                          src={order.product.imageUrl}
                          alt={order.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-serif font-medium text-stone-900 truncate">
                            {order.product.name}
                          </h3>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-[9px] sm:text-[10px] text-stone-400 font-mono">ID: {order.id}</p>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                         <p className="font-semibold text-stone-900 text-base sm:text-xl mb-0.5 sm:mb-1">
                           {formatPrice(order.product.price)}
                         </p>
                         {order.status === "Delivered" && !order.isReviewed && (
                           <button
                             onClick={() => onStartReview(order)}
                             className="px-3 py-1 text-[9px] sm:text-[10px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full transition-colors"
                           >
                             Write Review
                           </button>
                         )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 sm:p-8 rounded-3xl border border-dashed border-stone-300 bg-stone-50/50 text-center">
                  <p className="text-sm text-stone-500">No orders yet.</p>
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;