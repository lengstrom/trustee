(defproject trustee "0.1.0-SNAPSHOT"
  :description "An offline documentation viewer"
  :url "https://github.com/ddinh/trustee"
  :license {:name "GPL3"
            :url "http://www.gnu.org/licenses/gpl-3.0.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [seesaw "1.4.4"]
                 [org.clojure/clojurescript "0.0-2138"
                  :exclusions [org.apache.ant/ant]]
                 ]
  :jvm-opts ["-Xmx1g" "-XX:+UseConcMarkSweepGC"]d
  :cljsbuild {:builds [{:source-paths ["src"]
                        :compiler {:optimizations :simple
                                   :externs ["externs/jquery.js" "externs/throttle.js" "externs/codemirror.js"]
                                   :source-map "deploy/core/node_modules/trustee/bootstrap.js.map"
                                   :output-to "deploy/core/node_modules/trustee/bootstrap.js"
                                   :output-dir "deploy/core/node_modules/trustee/cljs/"
                                   :pretty-print true}}]}
  :plugins [[lein-cljsbuild "1.0.1"]]
  :source-paths ["src/"]
)
