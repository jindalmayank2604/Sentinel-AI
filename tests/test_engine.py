import numpy as np
from sentinel_ai.domain.models import Signal
from sentinel_ai.dsp.core import spectrum
from sentinel_ai.dsp.generators import generate
from sentinel_ai.reliability.models import topology_reliability, weibull_reliability
from sentinel_ai.simulation.rlc import SeriesRLC

def test_sine_peak_is_detected():
    signal=generate("Sine", 2000, 2, 82); spec=spectrum(signal)
    assert abs(spec.frequency_hz[np.argmax(spec.amplitude)]-82)<1

def test_reliability_and_topology():
    assert 0 < weibull_reliability(100,1000,2).survival < 1
    assert topology_reliability([.9,.8],"series")==.72

def test_rlc_parameters():
    assert SeriesRLC().natural_frequency_hz > 0
