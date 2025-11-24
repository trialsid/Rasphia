import React, { useRef, useEffect } from "react";
import type { Message as MessageType, Product } from "../types";
import Message from "./Message";

interface ChatWindowProps {
  messages: MessageType[];
  isLoading: boolean;
  onInitiateCheckout: (product: Product) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  products: Product[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onInitiateCheckout,
  wishlist,
  onToggleWishlist,
  products,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
         top: scrollRef.current.scrollHeight,
         behavior: "smooth"
      });
    }
  }, [messages, isLoading]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 md:px-10 py-6 scroll-smooth custom-scrollbar"
    >
       <div className="max-w-3xl mx-auto flex flex-col gap-6">
        {messages.map((msg, index) => (
          <Message
            key={index}
            message={msg}
            onInitiateCheckout={onInitiateCheckout}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
            products={products}
          />
        ))}
        {isLoading && (
          <Message
            message={{ author: "ai", text: "..." }}
            isLoading={true}
            onInitiateCheckout={() => {}}
            wishlist={[]}
            onToggleWishlist={() => {}}
            products={[]}
          />
        )}
       </div>
    </div>
  );
};

export default ChatWindow;
