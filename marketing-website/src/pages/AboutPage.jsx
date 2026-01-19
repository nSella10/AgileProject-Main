import React from "react";
import { useTranslation } from "react-i18next";
import PageLayout from "../components/PageLayout";

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "he";

  return (
    <PageLayout>
      <div
        className="bg-gradient-to-b from-purple-700 to-purple-900 py-16 text-white"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("about.title")}
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            {t("about.subtitle")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Our Story */}
        <div className="mb-16" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("about.our_story")}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 mb-6">
                {t("about.story_text_1")}
              </p>
              <p className="text-lg text-gray-700">{t("about.story_text_2")}</p>
            </div>
            <div className="bg-purple-100 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-purple-800 mb-4">
                {t("about.our_mission")}
              </h3>
              <p className="text-purple-700">{t("about.mission_text")}</p>
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="mb-16" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.leadership_team")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 max-w-md mx-auto">
            {[
              {
                name: t("about.team.omri.name"),
                role: t("about.team.omri.role"),
                bio: t("about.team.omri.bio"),
                initials: "OP",
              },
            ].map((member, idx) => (
              <div
                key={idx}
                className={`bg-white p-6 rounded-lg shadow-md ${
                  isRTL ? "text-center" : "text-center"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              >
                <div className="w-24 h-24 bg-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-700">
                    {member.initials}
                  </span>
                </div>
                <h3
                  className={`text-xl font-bold mb-2 ${
                    isRTL ? "text-center" : ""
                  }`}
                >
                  {member.name}
                </h3>
                <p
                  className={`text-purple-600 font-medium mb-3 ${
                    isRTL ? "text-center" : ""
                  }`}
                >
                  {member.role}
                </p>
                <p
                  className={`text-gray-600 text-sm ${
                    isRTL ? "text-center" : ""
                  }`}
                >
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Company Values */}
        <div className="mb-16" dir={isRTL ? "rtl" : "ltr"}>
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.our_values")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: t("about.values.innovation.title"),
                description: t("about.values.innovation.description"),
              },
              {
                title: t("about.values.accessibility.title"),
                description: t("about.values.accessibility.description"),
              },
              {
                title: t("about.values.community.title"),
                description: t("about.values.community.description"),
              },
              {
                title: t("about.values.excellence.title"),
                description: t("about.values.excellence.description"),
              },
            ].map((value, idx) => (
              <div key={idx} className="text-center p-6 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-purple-700 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div
          className="bg-purple-50 p-8 rounded-lg text-center"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <h2 className="text-2xl font-bold mb-4">{t("about.get_in_touch")}</h2>
          <p className="text-gray-700 mb-6">{t("about.contact_text")}</p>
          <div
            className={`flex flex-col md:flex-row justify-center items-center gap-4 ${
              isRTL ? "md:flex-row-reverse" : ""
            }`}
          >
            <a
              href="mailto:hello@guessify.com"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t("about.contact_us")}
            </a>
            <a
              href="/careers"
              className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors"
            >
              {t("about.join_team")}
            </a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutPage;
