(defproject trustee "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "BSD (3-clause) License"
            :url "http://opensource.org/licenses/BSD-3-Clause"}
  :dependencies [[org.clojure/clojure "1.5.1"]]
  :main ^:skip-aot trustee.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
