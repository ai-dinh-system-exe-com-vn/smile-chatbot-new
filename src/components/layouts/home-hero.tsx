"use client";

import { generateConversationId } from "@/lib/conversation";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeHero() {
  const router = useRouter();

  const createConversation = () => {
    const newId = generateConversationId();
    router.push(`/chat/${newId}`);
  };

  return (
    <div className="min-h-screen w-full overflow-auto">
      {/* Hero Section */}
      <div className="relative isolate px-4 pt-10 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-2xl py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight leading-tight sm:text-6xl sm:leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Intelligent Conversations
            </h1>
            <p className="mt-6 text-lg leading-8 text-base-content/80">
              Experience inspiring conversations with our smart AI assistant.
              Explore, learn, and solve problems together.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={createConversation}
                className="relative overflow-hidden px-8 py-3 text-lg font-medium text-white rounded-xl bg-gradient-to-r from-primary to-secondary transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 min-w-[200px] group cursor-pointer"
              >
                <span className="relative z-10">Start new chat</span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute inset-0 opacity-50 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%] animate-[shine_3s_ease-in-out_infinite]"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mx-auto mt-6 sm:mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-3 group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src="/globe.svg"
                        alt="Globe"
                        width={24}
                        height={24}
                        className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Diverse Topics
                    </h3>
                  </div>
                  <p className="mt-4 text-base-content/70 group-hover:text-base-content/90 transition-colors duration-300">
                    From work to entertainment, learning to advice - we're ready
                    to support you across all topics.
                  </p>
                </div>
              </div>
              <div className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-secondary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-4 sm:p-6 lg:p-8 backdrop-blur-sm">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 p-3 group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src="/window.svg"
                        alt="Window"
                        width={24}
                        height={24}
                        className="w-6 h-6 group-hover:-rotate-12 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                      Modern Interface
                    </h3>
                  </div>
                  <p className="mt-4 text-base-content/70 group-hover:text-base-content/90 transition-colors duration-300">
                    Experience smooth, friendly conversations with our
                    user-optimized interface design.
                  </p>
                </div>
              </div>
            </div>
            <footer className="mt-6 sm:mt-8 text-center text-sm text-gray-500">
              Created by{" "}
              <a
                href="https://github.com/alvin0"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Châu Lâm Đình Ái (Alvin0)
              </a>
            </footer>
          </div>
        </div>
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
      </div>
    </div>
  );
}
