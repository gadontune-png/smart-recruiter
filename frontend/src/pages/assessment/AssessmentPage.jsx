import { useParams } from "react-router-dom";
import FeaturePlaceholder from "../../components/common/FeaturePlaceholder";

function AssessmentPage() {
  const { id } = useParams();
  return (
    <FeaturePlaceholder
      title="Assessment"
      description={`Assessment session for ID: ${id}.`}
      feature="Assessment taking"
    />
  );
}

export default AssessmentPage;